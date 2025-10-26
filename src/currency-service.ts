import { Pool, PoolClient } from 'pg';
import {
  CurrencyType,
  TransactionType,
  EarnCurrencyRequest,
  SpendCurrencyRequest,
  PurchaseCurrencyRequest,
  CurrencyBalance,
  Transaction,
  TransactionHistory,
  CurrencyPackage,
  CurrencyPurchase
} from './types';

export class CurrencyService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getBalance(userId: string): Promise<CurrencyBalance> {
    const result = await this.pool.query(
      `SELECT currency_type, balance 
       FROM user_balances 
       WHERE user_id = $1`,
      [userId]
    );

    const balance: CurrencyBalance = {
      user_id: userId,
      soft_currency: 0,
      premium_currency: 0
    };

    result.rows.forEach(row => {
      if (row.currency_type === CurrencyType.SOFT) {
        balance.soft_currency = parseInt(row.balance);
      } else if (row.currency_type === CurrencyType.PREMIUM) {
        balance.premium_currency = parseInt(row.balance);
      }
    });

    return balance;
  }

  async earnCurrency(request: EarnCurrencyRequest): Promise<Transaction> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await this.ensureBalanceExists(client, request.user_id, request.currency_type);

      const balanceResult = await client.query(
        `SELECT balance FROM user_balances 
         WHERE user_id = $1 AND currency_type = $2 
         FOR UPDATE`,
        [request.user_id, request.currency_type]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('Balance record not found');
      }

      const currentBalance = parseInt(balanceResult.rows[0].balance);
      const newBalance = currentBalance + request.amount;

      await client.query(
        `UPDATE user_balances 
         SET balance = $1, updated_at = NOW() 
         WHERE user_id = $2 AND currency_type = $3`,
        [newBalance, request.user_id, request.currency_type]
      );

      const transactionResult = await client.query(
        `INSERT INTO transactions (
          user_id, currency_type, transaction_type, amount, 
          balance_before, balance_after, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          request.user_id,
          request.currency_type,
          request.transaction_type,
          request.amount,
          currentBalance,
          newBalance,
          request.description,
          request.metadata ? JSON.stringify(request.metadata) : null
        ]
      );

      await this.updateAnalytics(client, request.currency_type, request.transaction_type, request.amount, request.user_id);

      await client.query('COMMIT');
      return this.mapTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async spendCurrency(request: SpendCurrencyRequest): Promise<Transaction> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await this.ensureBalanceExists(client, request.user_id, request.currency_type);

      const balanceResult = await client.query(
        `SELECT balance FROM user_balances 
         WHERE user_id = $1 AND currency_type = $2 
         FOR UPDATE`,
        [request.user_id, request.currency_type]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('Balance record not found');
      }

      const currentBalance = parseInt(balanceResult.rows[0].balance);

      if (currentBalance < request.amount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = currentBalance - request.amount;

      await client.query(
        `UPDATE user_balances 
         SET balance = $1, updated_at = NOW() 
         WHERE user_id = $2 AND currency_type = $3`,
        [newBalance, request.user_id, request.currency_type]
      );

      const transactionResult = await client.query(
        `INSERT INTO transactions (
          user_id, currency_type, transaction_type, amount, 
          balance_before, balance_after, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          request.user_id,
          request.currency_type,
          request.transaction_type,
          -request.amount,
          currentBalance,
          newBalance,
          request.description,
          request.metadata ? JSON.stringify(request.metadata) : null
        ]
      );

      await this.updateAnalytics(client, request.currency_type, request.transaction_type, request.amount, request.user_id);

      await client.query('COMMIT');
      return this.mapTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async purchaseCurrency(request: PurchaseCurrencyRequest): Promise<CurrencyPurchase> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const packageResult = await client.query(
        `SELECT * FROM currency_packages WHERE package_id = $1 AND is_active = true`,
        [request.package_id]
      );

      if (packageResult.rows.length === 0) {
        throw new Error('Invalid or inactive package');
      }

      const pkg: CurrencyPackage = this.mapCurrencyPackage(packageResult.rows[0]);

      const purchaseResult = await client.query(
        `INSERT INTO currency_purchases (
          user_id, package_id, amount, price_usd, 
          payment_method, payment_gateway, payment_transaction_id, 
          receipt_data, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          request.user_id,
          request.package_id,
          pkg.currency_amount,
          pkg.price_usd,
          request.payment_method,
          request.payment_gateway,
          request.payment_transaction_id,
          request.receipt_data,
          'pending'
        ]
      );

      await client.query('COMMIT');
      return this.mapCurrencyPurchase(purchaseResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async completePurchase(purchaseId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const purchaseResult = await client.query(
        `SELECT * FROM currency_purchases WHERE purchase_id = $1 FOR UPDATE`,
        [purchaseId]
      );

      if (purchaseResult.rows.length === 0) {
        throw new Error('Purchase not found');
      }

      const purchase = purchaseResult.rows[0];

      if (purchase.status !== 'pending') {
        throw new Error('Purchase already processed');
      }

      await this.ensureBalanceExists(client, purchase.user_id, CurrencyType.PREMIUM);

      // Execute earning logic within the same transaction
      const balanceResult = await client.query(
        `SELECT balance FROM user_balances 
         WHERE user_id = $1 AND currency_type = $2 
         FOR UPDATE`,
        [purchase.user_id, CurrencyType.PREMIUM]
      );

      if (balanceResult.rows.length === 0) {
        throw new Error('Balance record not found');
      }

      const currentBalance = parseInt(balanceResult.rows[0].balance);
      const amount = parseInt(purchase.amount);
      const newBalance = currentBalance + amount;

      await client.query(
        `UPDATE user_balances 
         SET balance = $1, updated_at = NOW() 
         WHERE user_id = $2 AND currency_type = $3`,
        [newBalance, purchase.user_id, CurrencyType.PREMIUM]
      );

      const transactionResult = await client.query(
        `INSERT INTO transactions (
          user_id, currency_type, transaction_type, amount, 
          balance_before, balance_after, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          purchase.user_id,
          CurrencyType.PREMIUM,
          TransactionType.PURCHASE_CURRENCY,
          amount,
          currentBalance,
          newBalance,
          `Purchase of ${purchase.package_id} package`,
          JSON.stringify({ purchase_id: purchaseId })
        ]
      );

      await this.updateAnalytics(
        client,
        CurrencyType.PREMIUM,
        TransactionType.PURCHASE_CURRENCY,
        amount,
        purchase.user_id
      );

      await client.query(
        `UPDATE currency_purchases 
         SET status = 'completed', transaction_id = $1, completed_at = NOW() 
         WHERE purchase_id = $2`,
        [transactionResult.rows[0].transaction_id, purchaseId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TransactionHistory> {
    const offset = (page - 1) * pageSize;

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM transactions WHERE user_id = $1`,
      [userId]
    );

    const transactionsResult = await this.pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    );

    return {
      transactions: transactionsResult.rows.map(row => this.mapTransaction(row)),
      total_count: parseInt(countResult.rows[0].count),
      page,
      page_size: pageSize
    };
  }

  async getAvailablePackages(): Promise<CurrencyPackage[]> {
    const result = await this.pool.query(
      `SELECT * FROM currency_packages 
       WHERE is_active = true 
       ORDER BY display_order ASC`
    );

    return result.rows.map(row => this.mapCurrencyPackage(row));
  }

  private async ensureBalanceExists(
    client: PoolClient,
    userId: string,
    currencyType: CurrencyType
  ): Promise<void> {
    await client.query(
      `INSERT INTO user_balances (user_id, currency_type, balance)
       VALUES ($1, $2, 0)
       ON CONFLICT (user_id, currency_type) DO NOTHING`,
      [userId, currencyType]
    );
  }

  private async updateAnalytics(
    client: PoolClient,
    currencyType: CurrencyType,
    transactionType: TransactionType,
    amount: number,
    _userId: string
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await client.query(
      `INSERT INTO currency_analytics (
        date, currency_type, transaction_type, 
        total_transactions, total_amount, unique_users
      )
      VALUES ($1, $2, $3, 1, $4, 1)
      ON CONFLICT (date, currency_type, transaction_type)
      DO UPDATE SET
        total_transactions = currency_analytics.total_transactions + 1,
        total_amount = currency_analytics.total_amount + $4`,
      [today, currencyType, transactionType, amount]
    );
  }

  private mapTransaction(row: Record<string, unknown>): Transaction {
    return {
      transaction_id: row.transaction_id as string,
      user_id: row.user_id as string,
      currency_type: row.currency_type as CurrencyType,
      transaction_type: row.transaction_type as TransactionType,
      amount: parseInt(row.amount as string),
      balance_before: parseInt(row.balance_before as string),
      balance_after: parseInt(row.balance_after as string),
      description: row.description as string | undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      created_at: row.created_at as Date
    };
  }

  private mapCurrencyPackage(row: Record<string, unknown>): CurrencyPackage {
    return {
      package_id: row.package_id as string,
      name: row.name as string,
      description: row.description as string | undefined,
      currency_amount: parseInt(row.currency_amount as string),
      price_usd: parseFloat(row.price_usd as string),
      bonus_percentage: parseInt(row.bonus_percentage as string),
      is_active: row.is_active as boolean,
      display_order: row.display_order as number | undefined,
      created_at: row.created_at as Date,
      updated_at: row.updated_at as Date
    };
  }

  private mapCurrencyPurchase(row: Record<string, unknown>): CurrencyPurchase {
    return {
      purchase_id: row.purchase_id as string,
      user_id: row.user_id as string,
      transaction_id: row.transaction_id as string | undefined,
      package_id: row.package_id as string,
      amount: parseInt(row.amount as string),
      price_usd: parseFloat(row.price_usd as string),
      payment_method: row.payment_method as string | undefined,
      payment_gateway: row.payment_gateway as string | undefined,
      payment_transaction_id: row.payment_transaction_id as string | undefined,
      receipt_data: row.receipt_data as string | undefined,
      status: row.status as 'pending' | 'completed' | 'failed' | 'refunded',
      created_at: row.created_at as Date,
      completed_at: row.completed_at as Date | undefined
    };
  }
}

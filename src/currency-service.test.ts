import { Pool } from 'pg';
import { CurrencyService } from './currency-service';
import { CurrencyType, TransactionType } from './types';

describe('CurrencyService', () => {
  let pool: Pool;
  let currencyService: CurrencyService;
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/hip_hop_game_test'
    });
    currencyService = new CurrencyService(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getBalance', () => {
    it('should return zero balances for new user', async () => {
      const balance = await currencyService.getBalance(testUserId);
      
      expect(balance).toBeDefined();
      expect(balance.user_id).toBe(testUserId);
      expect(balance.soft_currency).toBeGreaterThanOrEqual(0);
      expect(balance.premium_currency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('earnCurrency', () => {
    it('should award soft currency for mission completion', async () => {
      const earnRequest = {
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.EARN_MISSION,
        amount: 100,
        description: 'Completed tutorial mission',
        metadata: { mission_id: 'tutorial_001' }
      };

      const transaction = await currencyService.earnCurrency(earnRequest);

      expect(transaction).toBeDefined();
      expect(transaction.user_id).toBe(testUserId);
      expect(transaction.currency_type).toBe(CurrencyType.SOFT);
      expect(transaction.amount).toBe(100);
      expect(transaction.balance_after).toBe(transaction.balance_before + 100);
    });

    it('should award premium currency for achievement', async () => {
      const earnRequest = {
        user_id: testUserId,
        currency_type: CurrencyType.PREMIUM,
        transaction_type: TransactionType.EARN_ACHIEVEMENT,
        amount: 50,
        description: 'First freestyle win',
        metadata: { achievement_id: 'first_win' }
      };

      const transaction = await currencyService.earnCurrency(earnRequest);

      expect(transaction).toBeDefined();
      expect(transaction.currency_type).toBe(CurrencyType.PREMIUM);
      expect(transaction.amount).toBe(50);
    });

    it('should handle concurrent earn requests safely', async () => {
      const requests = Array(5).fill(null).map(() => ({
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.EARN_QUIZ,
        amount: 10,
        description: 'Quiz answer'
      }));

      const results = await Promise.all(
        requests.map(req => currencyService.earnCurrency(req))
      );

      expect(results).toHaveLength(5);
      results.forEach(transaction => {
        expect(transaction.amount).toBe(10);
      });
    });
  });

  describe('spendCurrency', () => {
    beforeEach(async () => {
      await currencyService.earnCurrency({
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.EARN_MISSION,
        amount: 1000,
        description: 'Setup balance'
      });
    });

    it('should deduct currency for upgrade purchase', async () => {
      const spendRequest = {
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.SPEND_UPGRADE,
        amount: 500,
        description: 'Studio upgrade level 2',
        metadata: { item_id: 'studio', level: 2 }
      };

      const transaction = await currencyService.spendCurrency(spendRequest);

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(-500);
      expect(transaction.balance_after).toBe(transaction.balance_before - 500);
    });

    it('should throw error when insufficient balance', async () => {
      const spendRequest = {
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.SPEND_UPGRADE,
        amount: 999999,
        description: 'Expensive item'
      };

      await expect(currencyService.spendCurrency(spendRequest))
        .rejects.toThrow('Insufficient balance');
    });

    it('should prevent negative balance', async () => {
      const balance = await currencyService.getBalance(testUserId);
      
      const spendRequest = {
        user_id: testUserId,
        currency_type: CurrencyType.SOFT,
        transaction_type: TransactionType.SPEND_COSMETIC,
        amount: balance.soft_currency + 1,
        description: 'Over-budget item'
      };

      await expect(currencyService.spendCurrency(spendRequest))
        .rejects.toThrow('Insufficient balance');
    });
  });

  describe('purchaseCurrency', () => {
    it('should create pending purchase for valid package', async () => {
      const purchaseRequest = {
        user_id: testUserId,
        package_id: 'starter',
        payment_method: 'credit_card',
        payment_gateway: 'stripe',
        payment_transaction_id: 'pi_test_123456',
        receipt_data: 'encrypted_receipt'
      };

      const purchase = await currencyService.purchaseCurrency(purchaseRequest);

      expect(purchase).toBeDefined();
      expect(purchase.user_id).toBe(testUserId);
      expect(purchase.package_id).toBe('starter');
      expect(purchase.status).toBe('pending');
      expect(purchase.amount).toBeGreaterThan(0);
    });

    it('should reject invalid package id', async () => {
      const purchaseRequest = {
        user_id: testUserId,
        package_id: 'invalid_package',
        payment_method: 'credit_card',
        payment_gateway: 'stripe',
        payment_transaction_id: 'pi_test_invalid',
        receipt_data: 'encrypted_receipt'
      };

      await expect(currencyService.purchaseCurrency(purchaseRequest))
        .rejects.toThrow('Invalid or inactive package');
    });
  });

  describe('completePurchase', () => {
    it('should credit premium currency after purchase completion', async () => {
      const purchaseRequest = {
        user_id: testUserId,
        package_id: 'starter',
        payment_method: 'credit_card',
        payment_gateway: 'stripe',
        payment_transaction_id: 'pi_test_complete_' + Date.now(),
        receipt_data: 'encrypted_receipt'
      };

      const purchase = await currencyService.purchaseCurrency(purchaseRequest);
      const balanceBefore = await currencyService.getBalance(testUserId);

      await currencyService.completePurchase(purchase.purchase_id);

      const balanceAfter = await currencyService.getBalance(testUserId);

      expect(balanceAfter.premium_currency)
        .toBe(balanceBefore.premium_currency + purchase.amount);
    });

    it('should prevent double completion of purchase', async () => {
      const purchaseRequest = {
        user_id: testUserId,
        package_id: 'starter',
        payment_method: 'credit_card',
        payment_gateway: 'stripe',
        payment_transaction_id: 'pi_test_double_' + Date.now(),
        receipt_data: 'encrypted_receipt'
      };

      const purchase = await currencyService.purchaseCurrency(purchaseRequest);
      await currencyService.completePurchase(purchase.purchase_id);

      await expect(currencyService.completePurchase(purchase.purchase_id))
        .rejects.toThrow('Purchase already processed');
    });
  });

  describe('getTransactionHistory', () => {
    it('should return paginated transaction history', async () => {
      const history = await currencyService.getTransactionHistory(testUserId, 1, 10);

      expect(history).toBeDefined();
      expect(history.transactions).toBeInstanceOf(Array);
      expect(history.page).toBe(1);
      expect(history.page_size).toBe(10);
      expect(history.total_count).toBeGreaterThanOrEqual(0);
    });

    it('should return transactions in descending order by date', async () => {
      const history = await currencyService.getTransactionHistory(testUserId, 1, 20);

      if (history.transactions.length > 1) {
        for (let i = 1; i < history.transactions.length; i++) {
          const prevDate = new Date(history.transactions[i - 1].created_at);
          const currDate = new Date(history.transactions[i].created_at);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    });
  });

  describe('getAvailablePackages', () => {
    it('should return only active packages', async () => {
      const packages = await currencyService.getAvailablePackages();

      expect(packages).toBeInstanceOf(Array);
      expect(packages.length).toBeGreaterThan(0);
      
      packages.forEach(pkg => {
        expect(pkg.is_active).toBe(true);
        expect(pkg.currency_amount).toBeGreaterThan(0);
        expect(pkg.price_usd).toBeGreaterThan(0);
      });
    });

    it('should return packages in display order', async () => {
      const packages = await currencyService.getAvailablePackages();

      if (packages.length > 1) {
        for (let i = 1; i < packages.length; i++) {
          const prevOrder = packages[i - 1].display_order || 0;
          const currOrder = packages[i].display_order || 0;
          expect(currOrder).toBeGreaterThanOrEqual(prevOrder);
        }
      }
    });
  });
});

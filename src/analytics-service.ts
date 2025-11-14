import { Pool } from 'pg';
import { CurrencyType, TransactionType } from './types';

export interface AnalyticsReport {
  date: Date;
  currency_type: CurrencyType;
  total_earned: number;
  total_spent: number;
  net_change: number;
  unique_users: number;
  transactions: {
    type: TransactionType;
    count: number;
    amount: number;
  }[];
}

export interface RevenueReport {
  period: string;
  total_revenue: number;
  total_purchases: number;
  unique_buyers: number;
  average_transaction: number;
  package_breakdown: {
    package_id: string;
    count: number;
    revenue: number;
  }[];
}

export interface EconomyHealthMetrics {
  soft_currency: {
    total_in_circulation: number;
    average_per_user: number;
    daily_earn_rate: number;
    daily_spend_rate: number;
    inflation_rate: number;
  };
  premium_currency: {
    total_in_circulation: number;
    average_per_user: number;
    conversion_rate: number;
  };
  engagement: {
    active_earners: number;
    active_spenders: number;
    transaction_velocity: number;
  };
}

export class AnalyticsService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getDailyReport(date: Date, currencyType?: CurrencyType): Promise<AnalyticsReport[]> {
    const dateStr = date.toISOString().split('T')[0];
    
    const query = currencyType
      ? `SELECT * FROM currency_analytics 
         WHERE date = $1 AND currency_type = $2 
         ORDER BY transaction_type`
      : `SELECT * FROM currency_analytics 
         WHERE date = $1 
         ORDER BY currency_type, transaction_type`;

    const params = currencyType ? [dateStr, currencyType] : [dateStr];
    const result = await this.pool.query(query, params);

    const reportsByType = new Map<string, AnalyticsReport>();

    result.rows.forEach(row => {
      const key = `${row.currency_type}`;
      
      if (!reportsByType.has(key)) {
        reportsByType.set(key, {
          date: new Date(row.date),
          currency_type: row.currency_type,
          total_earned: 0,
          total_spent: 0,
          net_change: 0,
          unique_users: 0,
          transactions: []
        });
      }

      const report = reportsByType.get(key)!;
      const amount = parseInt(row.total_amount);

      if (this.isEarnTransaction(row.transaction_type)) {
        report.total_earned += amount;
      } else if (this.isSpendTransaction(row.transaction_type)) {
        report.total_spent += Math.abs(amount);
      }

      report.transactions.push({
        type: row.transaction_type,
        count: parseInt(row.total_transactions),
        amount: amount
      });
    });

    reportsByType.forEach(report => {
      report.net_change = report.total_earned - report.total_spent;
    });

    return Array.from(reportsByType.values());
  }

  async getRevenueReport(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueReport> {
    const result = await this.pool.query(
      `SELECT 
        COUNT(*) as total_purchases,
        SUM(price_usd) as total_revenue,
        COUNT(DISTINCT user_id) as unique_buyers,
        package_id
       FROM currency_purchases
       WHERE status = 'completed'
         AND completed_at >= $1 
         AND completed_at < $2
       GROUP BY package_id`,
      [startDate, endDate]
    );

    let totalRevenue = 0;
    let totalPurchases = 0;
    const packageBreakdown: { package_id: string; count: number; revenue: number }[] = [];

    result.rows.forEach(row => {
      const revenue = parseFloat(row.total_revenue) || 0;
      const count = parseInt(row.total_purchases) || 0;

      totalRevenue += revenue;
      totalPurchases += count;

      packageBreakdown.push({
        package_id: row.package_id,
        count,
        revenue
      });
    });

    const uniqueBuyersResult = await this.pool.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM currency_purchases
       WHERE status = 'completed'
         AND completed_at >= $1 
         AND completed_at < $2`,
      [startDate, endDate]
    );

    const uniqueBuyerCount = parseInt(uniqueBuyersResult.rows[0]?.count || '0');

    return {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      total_revenue: totalRevenue,
      total_purchases: totalPurchases,
      unique_buyers: uniqueBuyerCount,
      average_transaction: totalPurchases > 0 ? totalRevenue / totalPurchases : 0,
      package_breakdown: packageBreakdown
    };
  }

  async getEconomyHealth(): Promise<EconomyHealthMetrics> {
    const softCirculation = await this.pool.query(
      `SELECT 
        COALESCE(SUM(balance), 0) as total,
        COALESCE(AVG(balance), 0) as average,
        COUNT(*) as user_count
       FROM user_balances 
       WHERE currency_type = 'soft'`
    );

    const premiumCirculation = await this.pool.query(
      `SELECT 
        COALESCE(SUM(balance), 0) as total,
        COALESCE(AVG(balance), 0) as average,
        COUNT(*) as user_count
       FROM user_balances 
       WHERE currency_type = 'premium'`
    );

    const today = new Date().toISOString().split('T')[0];
    const dailyFlow = await this.pool.query(
      `SELECT 
        currency_type,
        transaction_type,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(unique_users), 0) as unique_users
       FROM currency_analytics
       WHERE date = $1
       GROUP BY currency_type, transaction_type`,
      [today]
    );

    let softEarnRate = 0;
    let softSpendRate = 0;
    let activeEarners = 0;
    let activeSpenders = 0;

    dailyFlow.rows.forEach(row => {
      const amount = parseInt(row.total_amount);
      const users = parseInt(row.unique_users);

      if (row.currency_type === 'soft') {
        if (this.isEarnTransaction(row.transaction_type)) {
          softEarnRate += amount;
          activeEarners += users;
        } else if (this.isSpendTransaction(row.transaction_type)) {
          softSpendRate += Math.abs(amount);
          activeSpenders += users;
        }
      }
    });

    const softTotal = parseInt(softCirculation.rows[0]?.total || '0');
    const inflationRate = softTotal > 0 
      ? ((softEarnRate - softSpendRate) / softTotal) * 100 
      : 0;

    const totalUsers = parseInt(softCirculation.rows[0]?.user_count || '0');
    const premiumUsers = parseInt(premiumCirculation.rows[0]?.user_count || '0');
    const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

    return {
      soft_currency: {
        total_in_circulation: softTotal,
        average_per_user: parseFloat(softCirculation.rows[0]?.average || '0'),
        daily_earn_rate: softEarnRate,
        daily_spend_rate: softSpendRate,
        inflation_rate: inflationRate
      },
      premium_currency: {
        total_in_circulation: parseInt(premiumCirculation.rows[0]?.total || '0'),
        average_per_user: parseFloat(premiumCirculation.rows[0]?.average || '0'),
        conversion_rate: conversionRate
      },
      engagement: {
        active_earners: activeEarners,
        active_spenders: activeSpenders,
        transaction_velocity: softEarnRate + softSpendRate
      }
    };
  }

  async trackCurrencyFlow(
    startDate: Date,
    endDate: Date,
    currencyType: CurrencyType
  ): Promise<{
    dates: string[];
    earned: number[];
    spent: number[];
    net: number[];
  }> {
    const result = await this.pool.query(
      `SELECT 
        date,
        transaction_type,
        total_amount
       FROM currency_analytics
       WHERE date >= $1 
         AND date < $2
         AND currency_type = $3
       ORDER BY date`,
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], currencyType]
    );

    const dataByDate = new Map<string, { earned: number; spent: number }>();

    result.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      
      if (!dataByDate.has(dateStr)) {
        dataByDate.set(dateStr, { earned: 0, spent: 0 });
      }

      const data = dataByDate.get(dateStr)!;
      const amount = parseInt(row.total_amount);

      if (this.isEarnTransaction(row.transaction_type)) {
        data.earned += amount;
      } else if (this.isSpendTransaction(row.transaction_type)) {
        data.spent += Math.abs(amount);
      }
    });

    const dates: string[] = [];
    const earned: number[] = [];
    const spent: number[] = [];
    const net: number[] = [];

    dataByDate.forEach((data, date) => {
      dates.push(date);
      earned.push(data.earned);
      spent.push(data.spent);
      net.push(data.earned - data.spent);
    });

    return { dates, earned, spent, net };
  }

  private isEarnTransaction(type: TransactionType): boolean {
    return type.startsWith('earn_') || type === TransactionType.PURCHASE_CURRENCY;
  }

  private isSpendTransaction(type: TransactionType): boolean {
    return type.startsWith('spend_');
  }
}

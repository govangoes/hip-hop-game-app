import { Pool } from 'pg';
import { CurrencyService } from './currency-service';
import { AnalyticsService } from './analytics-service';
import { PaymentGateway, StripePaymentProvider, AppleIAPProvider, GooglePlayProvider } from './payment-gateway';

export interface CurrencySystemConfig {
  database: {
    connectionString: string;
    ssl?: boolean;
  };
  payments: {
    stripe?: {
      apiKey: string;
    };
    apple?: {
      sharedSecret: string;
      sandbox: boolean;
    };
    google?: {
      serviceAccountKey: string;
    };
  };
}

export class CurrencySystem {
  public currencyService: CurrencyService;
  public analyticsService: AnalyticsService;
  public paymentGateway: PaymentGateway;
  private pool: Pool;

  constructor(config: CurrencySystemConfig) {
    this.pool = new Pool({
      connectionString: config.database.connectionString,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false
    });

    this.currencyService = new CurrencyService(this.pool);
    this.analyticsService = new AnalyticsService(this.pool);
    this.paymentGateway = new PaymentGateway();

    this.initializePaymentProviders(config.payments);
  }

  private initializePaymentProviders(payments: CurrencySystemConfig['payments']): void {
    if (payments.stripe) {
      this.paymentGateway.registerProvider(
        'stripe',
        new StripePaymentProvider(payments.stripe.apiKey)
      );
    }

    if (payments.apple) {
      this.paymentGateway.registerProvider(
        'apple',
        new AppleIAPProvider(payments.apple.sharedSecret, payments.apple.sandbox)
      );
    }

    if (payments.google) {
      this.paymentGateway.registerProvider(
        'google',
        new GooglePlayProvider(payments.google.serviceAccountKey)
      );
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export * from './types';
export * from './currency-service';
export * from './analytics-service';
export * from './payment-gateway';

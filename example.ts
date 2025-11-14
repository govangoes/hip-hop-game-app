import { CurrencySystem, CurrencyType, TransactionType } from './src';

async function main(): Promise<void> {
  // Initialize the currency system
  const system = new CurrencySystem({
    database: {
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/hip_hop_game',
      ssl: process.env.NODE_ENV === 'production'
    },
    payments: {
      stripe: {
        apiKey: process.env.STRIPE_API_KEY || 'sk_test_...'
      }
    }
  });

  const userId = '123e4567-e89b-12d3-a456-426614174000';

  console.log('Currency System Example\n');

  try {
    // Get initial balance
    console.log('1. Getting user balance...');
    const initialBalance = await system.currencyService.getBalance(userId);
    console.log(`   Soft Currency: ${initialBalance.soft_currency}`);
    console.log(`   Premium Currency: ${initialBalance.premium_currency}\n`);

    // Award soft currency for completing a mission
    console.log('2. Awarding 100 soft currency for mission completion...');
    const earnTx = await system.currencyService.earnCurrency({
      user_id: userId,
      currency_type: CurrencyType.SOFT,
      transaction_type: TransactionType.EARN_MISSION,
      amount: 100,
      description: 'Completed tutorial mission',
      metadata: { mission_id: 'tutorial_001', difficulty: 'easy' }
    });
    console.log(`   Transaction ID: ${earnTx.transaction_id}`);
    console.log(`   New Balance: ${earnTx.balance_after}\n`);

    // Spend currency for an upgrade
    console.log('3. Spending 50 soft currency for studio upgrade...');
    const spendTx = await system.currencyService.spendCurrency({
      user_id: userId,
      currency_type: CurrencyType.SOFT,
      transaction_type: TransactionType.SPEND_UPGRADE,
      amount: 50,
      description: 'Upgraded studio to level 2',
      metadata: { item_id: 'studio', level: 2 }
    });
    console.log(`   Transaction ID: ${spendTx.transaction_id}`);
    console.log(`   New Balance: ${spendTx.balance_after}\n`);

    // Get available packages
    console.log('4. Fetching available premium currency packages...');
    const packages = await system.currencyService.getAvailablePackages();
    console.log(`   Found ${packages.length} packages:`);
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: ${pkg.currency_amount} for $${pkg.price_usd}`);
    });
    console.log();

    // Get transaction history
    console.log('5. Fetching transaction history...');
    const history = await system.currencyService.getTransactionHistory(userId, 1, 5);
    console.log(`   Total transactions: ${history.total_count}`);
    console.log(`   Recent transactions: ${history.transactions.length}\n`);

    // Get analytics
    console.log('6. Fetching economy health metrics...');
    const health = await system.analyticsService.getEconomyHealth();
    console.log(`   Soft Currency Circulation: ${health.soft_currency.total_in_circulation}`);
    console.log(`   Inflation Rate: ${health.soft_currency.inflation_rate.toFixed(2)}%`);
    console.log(`   Conversion Rate: ${health.premium_currency.conversion_rate.toFixed(2)}%\n`);

    console.log('Example completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await system.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };

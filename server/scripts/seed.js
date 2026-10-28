import { connectToDatabase, closeDatabase } from '../src/config/db.js';
import { hashPassword } from '../src/utils/crypto.js';
import { toPaise } from '../src/utils/currency.js';
import { config } from '../src/config/env.js';

async function seed() {
  if (config.nodeEnv === 'production') {
    console.error('CRITICAL: Seed script cannot be run in production environment!');
    process.exit(1);
  }

  console.log('[Seed] Connecting to MongoDB...');
  const db = await connectToDatabase();

  const demoEmail = 'demo@vaultly.app';
  const demoEmailNormalized = demoEmail.toLowerCase();

  // Clean old demo data if exists
  const existingDemoUser = await db.collection('users').findOne({ emailNormalized: demoEmailNormalized });
  if (existingDemoUser) {
    console.log('[Seed] Cleaning previous demo data for', demoEmail);
    await db.collection('transactions').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('accounts').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('categories').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('budgets').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('savings_goals').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('recurring_transactions').deleteMany({ ownerId: existingDemoUser._id });
    await db.collection('sessions').deleteMany({ userId: existingDemoUser._id });
    await db.collection('users').deleteOne({ _id: existingDemoUser._id });
  }

  console.log('[Seed] Creating demo user: demo@vaultly.app (Password: Vaultly2026!)');
  const { hash, salt } = await hashPassword('Vaultly2026!');

  const userResult = await db.collection('users').insertOne({
    name: 'Kabir Verma',
    email: demoEmail,
    emailNormalized: demoEmailNormalized,
    passwordHash: hash,
    passwordSalt: salt,
    authProvider: 'local',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userId = userResult.insertedId;

  // 1. Accounts
  console.log('[Seed] Inserting realistic accounts...');
  const accountsData = [
    {
      ownerId: userId,
      name: 'HDFC Salary Account',
      type: 'bank',
      currency: 'INR',
      startingBalancePaise: toPaise(150000), // ₹1,50,000 opening
      color: '#F4D52E',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      name: 'SBI Emergency Savings',
      type: 'savings',
      currency: 'INR',
      startingBalancePaise: toPaise(85000), // ₹85,000 opening
      color: '#78D8A0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      name: 'Cash In Hand',
      type: 'cash',
      currency: 'INR',
      startingBalancePaise: toPaise(12000), // ₹12,000 opening
      color: '#FBBF24',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      name: 'Paytm / UPI Wallet',
      type: 'wallet',
      currency: 'INR',
      startingBalancePaise: toPaise(6500), // ₹6,500 opening
      color: '#60A5FA',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const accInsert = await db.collection('accounts').insertMany(accountsData);
  const accountIds = accInsert.insertedIds;
  const hdfcId = accountIds[0];
  const sbiId = accountIds[1];
  const cashId = accountIds[2];
  const upiId = accountIds[3];

  // 2. Categories
  console.log('[Seed] Inserting categories...');
  const categoriesData = [
    { ownerId: userId, name: 'Salary', type: 'income', icon: 'Briefcase', color: '#78D8A0' },
    { ownerId: userId, name: 'Freelance Design', type: 'income', icon: 'Laptop', color: '#34D399' },
    { ownerId: userId, name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#10B981' },
    { ownerId: userId, name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#F87171' },
    { ownerId: userId, name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F4D52E' },
    { ownerId: userId, name: 'Groceries & Supplies', type: 'expense', icon: 'ShoppingBag', color: '#FBBF24' },
    { ownerId: userId, name: 'Utilities & Internet', type: 'expense', icon: 'Zap', color: '#FB923C' },
    { ownerId: userId, name: 'Transportation & Fuel', type: 'expense', icon: 'Car', color: '#A78BFA' },
    { ownerId: userId, name: 'Entertainment & OTT', type: 'expense', icon: 'Film', color: '#EC4899' },
    { ownerId: userId, name: 'Healthcare & Fitness', type: 'expense', icon: 'Activity', color: '#F43F5E' },
    { ownerId: userId, name: 'Tech & Gadgets', type: 'expense', icon: 'Laptop', color: '#38BDF8' },
  ];

  const catInsert = await db.collection('categories').insertMany(
    categoriesData.map((c) => ({ ...c, isDefault: true, createdAt: new Date(), updatedAt: new Date() }))
  );
  const catIds = catInsert.insertedIds;
  const catSalary = catIds[0];
  const catFreelance = catIds[1];
  const catInvestments = catIds[2];
  const catRent = catIds[3];
  const catFood = catIds[4];
  const catGroceries = catIds[5];
  const catUtilities = catIds[6];
  const catTransport = catIds[7];
  const catEntertainment = catIds[8];
  const catHealthcare = catIds[9];
  const catTech = catIds[10];

  // 3. Transactions across recent months
  console.log('[Seed] Generating realistic transaction history...');
  const now = new Date();
  const txList = [];

  const addTx = (daysAgo, type, amountRupees, accountId, categoryId, desc, merchant, notes = '', tags = []) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    txList.push({
      ownerId: userId,
      type,
      amountPaise: toPaise(amountRupees),
      currency: 'INR',
      accountId,
      targetAccountId: null,
      categoryId,
      date: d,
      description: desc,
      merchant,
      notes,
      tags,
      createdAt: d,
      updatedAt: d,
    });
  };

  // Current Month Incomes & Expenses
  addTx(1, 'expense', 480, upiId, catFood, 'Cold Brew & Breakfast', 'Blue Tokai Coffee', 'Morning work session', ['coffee', 'work']);
  addTx(2, 'expense', 2340, hdfcId, catGroceries, 'Weekly Organic Groceries', 'Nature Basket', 'Vegetables and dairy', ['groceries']);
  addTx(3, 'expense', 1150, upiId, catTransport, 'Cab to Client Meeting', 'Uber India', 'Airport drop', ['transport']);
  addTx(5, 'expense', 1899, hdfcId, catUtilities, 'Airtel Fiber 300Mbps', 'Airtel Broadband', 'Monthly broadband', ['utilities', 'bills']);
  addTx(7, 'expense', 850, upiId, catFood, 'Dinner with Friends', 'Toit Brewery', 'Weekend get-together', ['dining']);
  addTx(10, 'income', 145000, hdfcId, catSalary, 'Monthly Corporate Salary', 'TechNova Solutions', 'October 2026 salary credited', ['salary']);
  addTx(12, 'income', 35000, hdfcId, catFreelance, 'UI/UX Design Retainer', 'Hyperloop Studio', 'Milestone 2 deliverable', ['freelance', 'client']);
  addTx(14, 'expense', 28000, hdfcId, catRent, 'Apartment Maintenance & Rent', 'Prestige Palms Society', 'October rent payment', ['rent', 'fixed']);
  addTx(16, 'expense', 4200, hdfcId, catHealthcare, 'Quarterly Gym Membership', 'Cult.fit Bengaluru', 'Strength and conditioning', ['fitness']);
  addTx(18, 'expense', 1499, upiId, catEntertainment, 'Netflix Premium & Spotify', 'Netflix India', 'Family subscription plan', ['ott', 'subscription']);
  addTx(20, 'expense', 3600, hdfcId, catTech, 'Logitech MX Master 3S Mouse', 'Amazon India', 'Ergonomic workspace upgrade', ['tech', 'gadgets']);

  // Previous Month Transactions
  addTx(32, 'income', 145000, hdfcId, catSalary, 'Monthly Corporate Salary', 'TechNova Solutions', 'September 2026 salary', ['salary']);
  addTx(34, 'expense', 28000, hdfcId, catRent, 'Apartment Maintenance & Rent', 'Prestige Palms Society', 'September rent', ['rent']);
  addTx(36, 'expense', 6800, hdfcId, catGroceries, 'Monthly Supermarket Haul', 'Zepto & Blinkit', 'Household staples', ['groceries']);
  addTx(38, 'expense', 5400, upiId, catFood, 'Weekend Dining & Takeouts', 'Swiggy Gourmet', 'Team dinner and takeout', ['food']);
  addTx(40, 'income', 22000, sbiId, catInvestments, 'Quarterly Mutual Fund Dividend', 'Zerodha Coin', 'Liquid fund dividend distribution', ['investments']);
  addTx(45, 'expense', 2500, cashId, catTransport, 'Fuel Refill & Tolls', 'Indian Oil Corporation', 'Highway road trip fuel', ['transport', 'fuel']);

  // 2 Months Ago Transactions
  addTx(62, 'income', 145000, hdfcId, catSalary, 'Monthly Corporate Salary', 'TechNova Solutions', 'August 2026 salary', ['salary']);
  addTx(64, 'expense', 28000, hdfcId, catRent, 'Apartment Maintenance & Rent', 'Prestige Palms Society', 'August rent', ['rent']);
  addTx(68, 'expense', 8500, hdfcId, catFood, 'Family Birthday Celebration', 'The Oberoi Restaurant', 'Special occasion dinner', ['food', 'celebration']);
  addTx(72, 'expense', 4500, upiId, catTransport, 'City Commute Metro & Cabs', 'Namma Metro', 'Monthly commute expenses', ['commute']);

  // 3 Months Ago Transactions
  addTx(92, 'income', 145000, hdfcId, catSalary, 'Monthly Corporate Salary', 'TechNova Solutions', 'July 2026 salary', ['salary']);
  addTx(94, 'expense', 28000, hdfcId, catRent, 'Apartment Maintenance & Rent', 'Prestige Palms Society', 'July rent', ['rent']);
  addTx(98, 'expense', 12000, hdfcId, catGroceries, 'Provisions & Gourmet Food', 'Foodhall India', 'Pantry stocking', ['groceries']);

  await db.collection('transactions').insertMany(txList);

  // 4. Monthly Budgets for Current Month
  console.log('[Seed] Inserting monthly budgets...');
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budgetsData = [
    { ownerId: userId, categoryId: catFood, month: currentMonthStr, limitPaise: toPaise(12000), createdAt: new Date() },
    { ownerId: userId, categoryId: catGroceries, month: currentMonthStr, limitPaise: toPaise(10000), createdAt: new Date() },
    { ownerId: userId, categoryId: catRent, month: currentMonthStr, limitPaise: toPaise(30000), createdAt: new Date() },
    { ownerId: userId, categoryId: catTransport, month: currentMonthStr, limitPaise: toPaise(5000), createdAt: new Date() },
    { ownerId: userId, categoryId: catUtilities, month: currentMonthStr, limitPaise: toPaise(4000), createdAt: new Date() },
    { ownerId: userId, categoryId: catEntertainment, month: currentMonthStr, limitPaise: toPaise(3500), createdAt: new Date() },
  ];
  await db.collection('budgets').insertMany(budgetsData);

  // 5. Savings Goals
  console.log('[Seed] Inserting savings goals...');
  const goalsData = [
    {
      ownerId: userId,
      title: '6-Month Emergency Fund',
      targetAmountPaise: toPaise(300000), // ₹3,00,000 target
      currentAmountPaise: toPaise(185000), // ₹1,85,000 saved (62%)
      targetDate: new Date(now.getFullYear(), 11, 31),
      category: 'Safety Net',
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      title: 'MacBook Pro M3 Max Upgrade',
      targetAmountPaise: toPaise(249000), // ₹2,49,000 target
      currentAmountPaise: toPaise(249000), // ₹2,49,000 completed! (100%)
      targetDate: new Date(now.getFullYear(), now.getMonth(), 15),
      category: 'Electronics & Work',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      title: 'Goa Coastal Getaway Trip',
      targetAmountPaise: toPaise(45000), // ₹45,000 target
      currentAmountPaise: toPaise(28000), // ₹28,000 saved (62%)
      targetDate: new Date(now.getFullYear(), 11, 20),
      category: 'Travel & Vacation',
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await db.collection('savings_goals').insertMany(goalsData);

  // 6. Recurring Transactions
  console.log('[Seed] Inserting recurring transactions...');
  const nextRentDue = new Date(now.getFullYear(), now.getMonth() + 1, 5);
  const nextWifiDue = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
  const nextNetflixDue = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 12);

  const recurringData = [
    {
      ownerId: userId,
      description: 'Apartment Monthly Rent',
      type: 'expense',
      amountPaise: toPaise(28000),
      frequency: 'monthly',
      nextDueDate: nextRentDue,
      accountId: hdfcId,
      categoryId: catRent,
      merchant: 'Prestige Palms Society',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      description: 'Airtel Broadband Internet',
      type: 'expense',
      amountPaise: toPaise(1899),
      frequency: 'monthly',
      nextDueDate: nextWifiDue,
      accountId: hdfcId,
      categoryId: catUtilities,
      merchant: 'Airtel Broadband',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      description: 'Netflix 4K Streaming Plan',
      type: 'expense',
      amountPaise: toPaise(649),
      frequency: 'monthly',
      nextDueDate: nextNetflixDue,
      accountId: upiId,
      categoryId: catEntertainment,
      merchant: 'Netflix India',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await db.collection('recurring_transactions').insertMany(recurringData);

  console.log('='.repeat(60));
  console.log('  DEMO SEED COMPLETED SUCCESSFULLY!');
  console.log(`  Login Email   : ${demoEmail}`);
  console.log(`  Password      : Vaultly2026!`);
  console.log(`  Database      : ${config.dbName} (Inspect with MongoDB Compass)`);
  console.log('='.repeat(60));

  await closeDatabase();
}

seed().catch((err) => {
  console.error('[Seed] Error seeding data:', err);
  process.exit(1);
});

/**
 * Seed MongoDB with existing JSON data
 * Run: node scripts/seed-mongodb.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'waisira';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  
  console.log('🔄 Connecting to MongoDB...');
  
  // Read JSON files
  const products = require('../src/data/products.json').products;
  const pages = require('../src/data/pages.json').pages;
  const portfolio = require('../src/data/portfolio.json').portfolio;
  
  // Clear existing data
  console.log('🗑️  Clearing existing collections...');
  await db.collection('products').deleteMany({});
  await db.collection('pages').deleteMany({});
  await db.collection('portfolio').deleteMany({});
  
  // Add timestamps
  const now = new Date();
  const productsWithTs = products.map(p => ({ ...p, createdAt: now, updatedAt: now }));
  const pagesWithTs = pages.map(p => ({ ...p, createdAt: now, updatedAt: now }));
  const portfolioWithTs = portfolio.map(p => ({ ...p, createdAt: now, updatedAt: now }));
  
  // Insert data
  console.log(`📦 Seeding ${productsWithTs.length} products...`);
  await db.collection('products').insertMany(productsWithTs);
  
  console.log(`📦 Seeding ${pagesWithTs.length} pages...`);
  await db.collection('pages').insertMany(pagesWithTs);
  
  console.log(`📦 Seeding ${portfolioWithTs.length} portfolio items...`);
  await db.collection('portfolio').insertMany(portfolioWithTs);
  
  console.log('✅ MongoDB seeding complete!');
  console.log('');
  console.log('📋 Collections created:');
  console.log('   - products');
  console.log('   - pages');
  console.log('   - portfolio');
  console.log('');
  console.log('⚠️  Remember to set MONGODB_URI environment variable on Vercel!');
  
  await client.close();
}

seed().catch(console.error);

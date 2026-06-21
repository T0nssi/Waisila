/**
 * Seed MongoDB with existing JSON data
 * Run: node scripts/seed-mongodb.js
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'waisira';

function loadJson(filename) {
  const path = join(__dirname, '..', 'src', 'data', filename);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log('🔄 Connecting to MongoDB...');
  console.log(`   DB: ${DB_NAME}`);

  // Read JSON files
  const productsData = loadJson('products.json');
  const pagesData = loadJson('pages.json');
  const portfolioData = loadJson('portfolio.json');
  const settingsData = loadJson('settings.json');
  const testimonialsData = loadJson('testimonials.json');

  const now = new Date();

  // Helper to add timestamps
  const withTs = (arr) => arr.map(item => ({ ...item, createdAt: now, updatedAt: now }));

  // Clear existing data
  console.log('🗑️  Clearing existing collections...');
  await db.collection('products').deleteMany({});
  await db.collection('pages').deleteMany({});
  await db.collection('portfolio').deleteMany({});
  await db.collection('settings').deleteMany({});
  await db.collection('testimonials').deleteMany({});
  await db.collection('images').deleteMany({});

  // Seed products
  console.log(`📦 Seeding ${productsData.products.length} products...`);
  await db.collection('products').insertMany(withTs(productsData.products));

  // Seed pages
  console.log(`📦 Seeding ${pagesData.pages.length} pages...`);
  await db.collection('pages').insertMany(withTs(pagesData.pages));

  // Seed portfolio
  console.log(`📦 Seeding ${portfolioData.portfolio.length} portfolio items...`);
  await db.collection('portfolio').insertMany(withTs(portfolioData.portfolio));

  // Seed settings
  console.log(`📦 Seeding settings...`);
  await db.collection('settings').insertOne({ ...settingsData, createdAt: now, updatedAt: now });

  // Seed testimonials
  console.log(`📦 Seeding ${testimonialsData.testimonials.length} testimonials...`);
  await db.collection('testimonials').insertMany(withTs(testimonialsData.testimonials));

  // Seed images (empty, just collection structure)
  console.log(`📦 Seeding images collection...`);
  await db.collection('images').deleteMany({});

  console.log('');
  console.log('✅ MongoDB seeding complete!');
  console.log('');
  console.log('📋 Collections created:');
  console.log('   - products');
  console.log('   - pages');
  console.log('   - portfolio');
  console.log('   - settings');
  console.log('   - testimonials');
  console.log('');
  console.log('⚠️  Remember to set MONGODB_URI environment variable on Vercel!');

  await client.close();
}

seed().catch(console.error);

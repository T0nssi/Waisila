/**
 * WAISIRA MongoDB Seed Script
 * 
 * Usage:
 *   1. Set MONGODB_URI environment variable
 *      export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net"
 *   2. Run: node seed-mongo.js
 * 
 * This script uploads all JSON data to MongoDB.
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'waisira';

// Load JSON data
const fs = require('fs');
const path = require('path');

const pagesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/pages.json'), 'utf-8'));
const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/settings.json'), 'utf-8'));
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/products.json'), 'utf-8'));
const portfolioData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/portfolio.json'), 'utf-8'));
const testimonialsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/testimonials.json'), 'utf-8'));

const COLLECTIONS = {
  PAGES: 'pages',
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  PORTFOLIO: 'portfolio',
  TESTIMONIALS: 'testimonials',
};

async function seed() {
  console.log('🚀 Starting MongoDB seed...\n');
  console.log(`📡 Connecting to: ${MONGODB_URI.split('@')[1] || 'localhost'}\n`);

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Helper function
    async function uploadCollection(collectionName, data, query = {}) {
      const collection = db.collection(collectionName);
      const count = Array.isArray(data) ? data.length : 1;
      
      console.log(`📤 Uploading ${count} items to "${collectionName}"...`);
      
      if (Array.isArray(data)) {
        // Clear existing and insert all
        await collection.deleteMany({});
        if (data.length > 0) {
          await collection.insertMany(data);
        }
      } else {
        // Single document - upsert
        await collection.deleteMany({});
        await collection.insertOne({ ...data, updatedAt: new Date() });
      }
      
      console.log(`   ✅ ${count} items uploaded\n`);
      return count;
    }
    
    // 1. Settings (single document)
    const settingsDoc = {
      ...settingsData,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    await uploadCollection(COLLECTIONS.SETTINGS, settingsDoc);
    
    // 2. Pages
    const pagesWithDates = pagesData.pages.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await uploadCollection(COLLECTIONS.PAGES, pagesWithDates);
    
    // 3. Products
    const productsWithDates = productsData.products.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await uploadCollection(COLLECTIONS.PRODUCTS, productsWithDates);
    
    // 4. Portfolio
    const portfolioWithDates = portfolioData.portfolio.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await uploadCollection(COLLECTIONS.PORTFOLIO, portfolioWithDates);
    
    // 5. Testimonials
    const testimonialsWithDates = testimonialsData.testimonials.map(t => ({
      ...t,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await uploadCollection(COLLECTIONS.TESTIMONIALS, testimonialsWithDates);
    
    console.log('═══════════════════════════════════════');
    console.log('✅ MongoDB seed completed successfully!');
    console.log('═══════════════════════════════════════\n');
    console.log('Collections uploaded:');
    console.log(`  • settings     → 1 document`);
    console.log(`  • pages         → ${pagesData.pages.length} pages`);
    console.log(`  • products      → ${productsData.products.length} products`);
    console.log(`  • portfolio     → ${portfolioData.portfolio.length} items`);
    console.log(`  • testimonials  → ${testimonialsData.testimonials.length} items`);
    console.log(`\n🌐 Database: ${DB_NAME}`);
    console.log('\nNext step: Add MONGODB_URI to Vercel and redeploy!\n');
    
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();

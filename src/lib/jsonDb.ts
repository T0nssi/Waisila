import { readJsonFile, getDataFile } from './apiHelpers';

// Check if MongoDB should be used
const USE_MONGODB = !!process.env.MONGODB_URI;

// Products - uses JSON (with optional MongoDB fallback)
export async function readProducts(): Promise<any[]> {
  if (USE_MONGODB) {
    try {
      const { getCollection, COLLECTIONS } = await import('./mongodb');
      const collection = await getCollection(COLLECTIONS.PRODUCTS);
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('MongoDB read error, falling back to JSON:', error);
    }
  }
  const data = readJsonFile(getDataFile('products.json'), { products: [] });
  return data.products || [];
}

// Pages - uses JSON (with optional MongoDB fallback)
export async function readPages(): Promise<any[]> {
  if (USE_MONGODB) {
    try {
      const { getCollection, COLLECTIONS } = await import('./mongodb');
      const collection = await getCollection(COLLECTIONS.PAGES);
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('MongoDB read error, falling back to JSON:', error);
    }
  }
  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
  return data.pages || [];
}

// Portfolio - uses JSON (with optional MongoDB fallback)
export async function readPortfolio(): Promise<any[]> {
  if (USE_MONGODB) {
    try {
      const { getCollection, COLLECTIONS } = await import('./mongodb');
      const collection = await getCollection(COLLECTIONS.PORTFOLIO);
      return await collection.find({}).toArray();
    } catch (error) {
      console.error('MongoDB read error, falling back to JSON:', error);
    }
  }
  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  return data.portfolio || [];
}

// Legacy sync versions (for API routes that need sync)
export function readProductsSync(): any[] {
  const data = readJsonFile(getDataFile('products.json'), { products: [] });
  return data.products || [];
}

export function readPagesSync(): any[] {
  const data = readJsonFile(getDataFile('pages.json'), { pages: [] });
  return data.pages || [];
}

export function readPortfolioSync(): any[] {
  const data = readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
  return data.portfolio || [];
}

// Testimonials - uses JSON (with optional MongoDB fallback)
export async function readTestimonials(): Promise<any[]> {
  if (USE_MONGODB) {
    try {
      const { getCollection, COLLECTIONS } = await import('./mongodb');
      const collection = await getCollection(COLLECTIONS.TESTIMONIALS);
      return await collection.find({ active: true }).toArray();
    } catch (error) {
      console.error('MongoDB read error, falling back to JSON:', error);
    }
  }
  const data = readJsonFile(getDataFile('testimonials.json'), { testimonials: [] });
  return (data.testimonials || []).filter((t: any) => t.active);
}

// Settings - uses JSON (with optional MongoDB fallback)
export async function readSettings(): Promise<any> {
  if (USE_MONGODB) {
    try {
      const { getCollection, COLLECTIONS } = await import('./mongodb');
      const collection = await getCollection(COLLECTIONS.SETTINGS);
      const doc = await collection.findOne({});
      return doc || {};
    } catch (error) {
      console.error('MongoDB read error, falling back to JSON:', error);
    }
  }
  return readJsonFile(getDataFile('settings.json'), {});
}

// Settings sync version
export function readSettingsSync(): any {
  return readJsonFile(getDataFile('settings.json'), {});
}

// Legacy combined read (for pages that need all data at once)
export function readJson(): any {
  return {
    products: readProductsSync(),
    pages: readPagesSync(),
    portfolio: readPortfolioSync(),
    settings: readSettingsSync(),
  };
}

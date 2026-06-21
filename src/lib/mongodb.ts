import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'waisira';

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }
  
  cachedClient = new MongoClient(MONGODB_URI);
  await cachedClient.connect();
  
  return cachedClient;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

export async function getCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}

// Collections
export const COLLECTIONS = {
  PRODUCTS: 'products',
  PORTFOLIO: 'portfolio',
  PAGES: 'pages',
  SETTINGS: 'settings',
  TESTIMONIALS: 'testimonials',
  IMAGES: 'images',
} as const;

import { MongoClient } from 'mongodb';

const MONGODB_URI = import.meta.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = import.meta.env.MONGODB_DB || 'waisira';

let cachedClient: MongoClient | null = null;
let cachedClientPromise: Promise<MongoClient> | null = null;

function redactUri(uri: string): string {
  return uri.replace(/\/\/.*@/, '//<credentials>@');
}

function connectClient(): Promise<MongoClient> {
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error(
      '[mongodb] MONGODB_URI looks malformed — it must start with "mongodb://" or "mongodb+srv://". Got:',
      redactUri(MONGODB_URI)
    );
  }

  console.log('[mongodb] Connecting to', redactUri(MONGODB_URI));

  return new MongoClient(MONGODB_URI)
    .connect()
    .then((client) => {
      cachedClient = client; // only cache once the connection actually succeeds
      console.log('[mongodb] Connected successfully, using database:', DB_NAME);
      return client;
    })
    .catch((error) => {
      cachedClientPromise = null; // clear so the next call retries instead of reusing a dead promise
      console.error('[mongodb] Connection failed:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
      });
      throw error;
    });
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  // Reuse an in-flight connection attempt so concurrent calls don't each open a new client
  if (!cachedClientPromise) {
    cachedClientPromise = connectClient();
  }

  return cachedClientPromise;
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
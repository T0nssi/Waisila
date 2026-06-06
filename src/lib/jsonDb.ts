import fs from 'fs';
import path from 'path';

const PAGES_FILE = path.join(process.cwd(), 'src/data/pages.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'src/data/products.json');
const PORTFOLIO_FILE = path.join(process.cwd(), 'src/data/portfolio.json');

export function readPages(): any {
  try {
    const content = fs.readFileSync(PAGES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { pages: [] };
  }
}

export function readProducts(): any {
  try {
    const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { products: [] };
  }
}

export function readPortfolio(): any {
  try {
    const content = fs.readFileSync(PORTFOLIO_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { portfolio: [] };
  }
}

export function readJson(): any {
  // Returns pages.json by default for backwards compatibility
  return readPages();
}

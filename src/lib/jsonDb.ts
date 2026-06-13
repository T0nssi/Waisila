import { readJsonFile, getDataFile } from './apiHelpers';

export function readPages(): any {
  return readJsonFile(getDataFile('pages.json'), { pages: [] });
}

export function readProducts(): any {
  return readJsonFile(getDataFile('products.json'), { products: [] });
}

export function readPortfolio(): any {
  return readJsonFile(getDataFile('portfolio.json'), { portfolio: [] });
}

export function readJson(): any {
  return readPages();
}

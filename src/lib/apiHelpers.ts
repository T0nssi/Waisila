import fs from 'fs';
import path from 'path';

export function readJsonFile<T = any>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return defaultValue;
}

export function writeJsonFile(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getDataFile(filename: string): string {
  return path.join(process.cwd(), 'src/data', filename);
}

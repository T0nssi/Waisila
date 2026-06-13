export function generateId(prefix: string = 'id'): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

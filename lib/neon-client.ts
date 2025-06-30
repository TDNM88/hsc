// Tạo dynamic import cho @neondatabase/serverless để tránh lỗi "self is not defined"

let neonClient: any = null;
let drizzleClient: any = null;

export async function getNeonClient() {
  if (typeof window !== 'undefined') {
    // Trên client side, trả về một mock client
    return {
      // Mock các phương thức cần thiết
      query: () => Promise.resolve([]),
    };
  }

  // Trên server side, import và sử dụng thư viện thực tế
  if (!neonClient) {
    const { neon } = await import('@neondatabase/serverless');
    const { config } = await import('../config');
    neonClient = neon(config.database.url);
  }
  return neonClient;
}

export async function getDrizzleClient() {
  if (typeof window !== 'undefined') {
    // Trên client side, trả về một mock client
    return {
      // Mock các phương thức cần thiết
      query: () => Promise.resolve([]),
      select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
      insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
      update: () => ({ set: () => ({ where: () => Promise.resolve([]) }) }),
      delete: () => ({ where: () => Promise.resolve([]) }),
      transaction: async (cb: any) => await cb({}),
    };
  }

  // Trên server side, import và sử dụng thư viện thực tế
  if (!drizzleClient) {
    const { drizzle } = await import('drizzle-orm/neon-http');
    const neonClient = await getNeonClient();
    const schema = await import('./schema');
    drizzleClient = drizzle(neonClient, { schema });
  }
  return drizzleClient;
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

// Test connection
try {
  const result = await sql`SELECT 1 as test`;
  console.log('Database connection successful!', result);
} catch (error) {
  console.error('Database connection failed:', error);
}

await sql.end();

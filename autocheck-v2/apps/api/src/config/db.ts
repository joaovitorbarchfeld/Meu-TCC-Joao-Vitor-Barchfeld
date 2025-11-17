import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { env } from './env';
import type { Database } from '../types/database';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await db.destroy();
  await pool.end();
}

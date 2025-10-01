import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import type { Database } from '@/types/database';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/autocheck';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});

export { pool };
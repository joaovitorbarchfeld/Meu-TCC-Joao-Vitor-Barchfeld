import { Pool } from 'pg';
import { Kysely } from 'kysely';
import type { Database } from '../types/database';
export declare const pool: Pool;
export declare const db: Kysely<Database>;
export declare function testConnection(): Promise<boolean>;
export declare function closeDatabase(): Promise<void>;

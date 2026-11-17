import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: ['.env.local', '.env'] });

let sql;

export function getDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada. Informe a URL do Neon em .env.local ou .env.');
  }
  sql ??= neon(connectionString);
  return sql;
}

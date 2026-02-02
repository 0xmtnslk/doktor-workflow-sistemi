import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'doktor_db',
  user: 'doktoradmin',
  password: 'sifre1234',
});
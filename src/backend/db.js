/*
* Database Connection Pool
 * Understanding
 * This file creates and exports a single shared connection pool to the PostgreSQL database. 
 * All controllers import this pool to run queries instead of opening new connections each time.
 *
 * What This File Does
 *   1. Reads DB credentials from environment variables (.env)
 *   2. Creates a pg.Pool with host, port, database, user, and password
 *   3. Exports the pool so any controller can call pool.query()
 *
 * Key Terms
 *   Pool - a group of reusable DB connections
 *   pg - the node postgres library used to talk to PostgreSQL
 *   .env - file where DB credentials are stored 
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'olms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

module.exports = pool;
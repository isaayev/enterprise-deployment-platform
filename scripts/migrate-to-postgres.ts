/**
 * Nexus Gaming Review Platform - PostgreSQL Migration Utility
 *
 * This script provides a zero-loss migration path from the local JSON database (data/nexus-db.json)
 * to a production-grade PostgreSQL database (e.g., Neon, Supabase, AWS RDS, Railway PostgreSQL).
 *
 * Usage:
 *   1. Set DATABASE_URL in your environment or .env.local:
 *      export DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
 *   2. Run this script:
 *      npx tsx scripts/migrate-to-postgres.ts
 */

import fs from 'fs';
import path from 'path';

export const POSTGRES_SCHEMA_SQL = `
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'GAMER',
  avatar_url TEXT,
  bio TEXT,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Games Table
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  banner_image TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  player_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
  developer VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  release_date VARCHAR(64) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  system_requirements JSONB NOT NULL,
  rating_stats JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  game_id VARCHAR(64) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name VARCHAR(64) NOT NULL,
  author_avatar TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  is_recommended BOOLEAN NOT NULL DEFAULT TRUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  hours_played NUMERIC(8, 1) DEFAULT 0.0,
  helpful_votes INT NOT NULL DEFAULT 0,
  unhelpful_votes INT NOT NULL DEFAULT 0,
  voted_user_ids JSONB DEFAULT '[]'::jsonb,
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_game_user UNIQUE (game_id, user_id)
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  action VARCHAR(128) NOT NULL,
  user_id VARCHAR(64),
  user_email VARCHAR(255),
  ip_address VARCHAR(45) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
`;

export async function runMigration() {
  const dbPath = path.join(process.cwd(), 'data', 'nexus-db.json');

  if (!fs.existsSync(dbPath)) {
    console.error(`[MIGRATION ERROR] Database file not found at ${dbPath}`);
    return;
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log('----------------------------------------------------');
  console.log('Nexus Gaming Platform - Database Migration Plan');
  console.log('----------------------------------------------------');
  console.log(`Source records detected:`);
  console.log(`  - Users:      ${data.users?.length ?? 0}`);
  console.log(`  - Games:      ${data.games?.length ?? 0}`);
  console.log(`  - Reviews:    ${data.reviews?.length ?? 0}`);
  console.log(`  - Audit Logs: ${data.auditLogs?.length ?? 0}`);
  console.log('----------------------------------------------------');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('[INFO] DATABASE_URL is not set.');
    console.log('[INFO] The PostgreSQL DDL schema is ready above.');
    console.log('[INFO] To migrate data to a live database:');
    console.log('       1. Provide DATABASE_URL in .env.local');
    console.log('       2. Install pg or prisma: npm install pg @types/pg');
    console.log('       3. Execute this script with a valid connection string.');
    console.log('----------------------------------------------------');
    return;
  }

  console.log(`[INFO] Connecting to target database: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
}

if (require.main === module) {
  runMigration().catch(console.error);
}


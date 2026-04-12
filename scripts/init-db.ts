
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 创建 users 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    // 创建 users 表的索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS users_username_idx ON users USING btree (username ASC NULLS LAST)
    `);

    // 创建 health_check 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS health_check (
        id SERIAL NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 创建 blog_posts 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    // 创建 blog_posts 表的索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts USING btree (created_at ASC NULLS LAST)
    `);

    // 创建 game_records 表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS game_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        scenario VARCHAR(100) NOT NULL,
        final_score INTEGER NOT NULL,
        result VARCHAR(20) NOT NULL,
        played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `);

    // 创建 game_records 表的索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS game_records_user_id_idx ON game_records USING btree (user_id ASC NULLS LAST)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS game_records_played_at_idx ON game_records USING btree (played_at ASC NULLS LAST)
    `);

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();


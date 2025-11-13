import pool from './connection.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42501') {
      console.error('\n💡 Permission denied. Run this as database owner:');
      console.error('   psql -U postgres -d stock_tracker');
      console.error('   ALTER DATABASE stock_tracker OWNER TO your_username;');
    }
    process.exit(1);
  }
}

migrate();


import db from './db.js';

console.log('[Database] Initializing tables...');

try {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE NOT NULL,
      username TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('[Database] Table "users" is ready.');

  // Create otp_verifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      is_verified INTEGER DEFAULT 0
    )
  `);
  console.log('[Database] Table "otp_verifications" is ready.');

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message_type TEXT DEFAULT 'text',
      content TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);
  console.log('[Database] Table "messages" is ready.');

  // Migration: Add status column if it doesn't exist
  const tableInfo = db.prepare("PRAGMA table_info(messages)").all();
  const hasStatusColumn = tableInfo.some(col => col.name === 'status');
  if (!hasStatusColumn) {
    console.log('[Database] Migrating: Adding "status" column to "messages" table...');
    db.exec("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'");
    console.log('[Database] Migration completed.');
  }

  // Create indexes for fast lookups
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_number)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON messages(receiver_id, sender_id)');
  console.log('[Database] Indexes created.');

  console.log('[Database] Initialization completed successfully.');
} catch (error) {
  console.error('[Database] Initialization failed:', error);
  process.exit(1);
}

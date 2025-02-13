import Database from 'better-sqlite3';

const db = new Database('food_listings.db');

// Create food_listings table
db.exec(`
  CREATE TABLE IF NOT EXISTS food_listings (
    id TEXT PRIMARY KEY,
    donor_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    event_type TEXT,
    location TEXT NOT NULL,
    expiry_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create food_requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS food_requests (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_quantity INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES food_listings(id)
  )
`);

console.log('Database setup completed');
db.close();
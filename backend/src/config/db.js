const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const db = {
  query: (text, params) => pool.query(text, params),
};

const initDb = () => {
  return new Promise((resolve, reject) => {
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        amount NUMERIC NOT NULL,
        status TEXT NOT NULL,
        transaction_id TEXT,
        login_session_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        lottery_type TEXT,
        input_numbers TEXT,
        predicted_numbers TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `;
    db.query(createTablesQuery)
      .then(() => {
        console.log('Database tables are ready.');
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          return db.query(`UPDATE users SET role = 'admin' WHERE email = $1`, [adminEmail]);
        }
        return Promise.resolve();
      })
      .then(() => {
        if (process.env.ADMIN_EMAIL) {
          console.log('Admin role checked/set.');
        }
        resolve();
      })
      .catch(err => {
        console.error("Error initializing database tables", err);
        reject(err);
      });
  });
};

module.exports = { db, initDb };

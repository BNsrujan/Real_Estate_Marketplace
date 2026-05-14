import { pool } from '../db/db.js';

const createUsersTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
};

const User = {
    create: async ({ username, email, password }) => {
        const { rows } = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, created_at`,
            [username, email, password]
        );
        return rows[0];
    },

    findByEmail: async (email) => {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return rows[0] || null;
    },

    findById: async (id) => {
        const { rows } = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    },
};

export { User, createUsersTable };

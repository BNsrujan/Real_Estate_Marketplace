import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
});

export const db = drizzle(pool, { schema });

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log(`DB Connected: ${client.database} @ ${client.host}`);
        client.release();
    } catch (error) {
        console.log(`DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export { pool };
export default connectDB;

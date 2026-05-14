import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT) || 5432,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
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

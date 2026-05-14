import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
    schema: './src/db/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        host: process.env.PG_HOST || 'localhost',
        port: Number(process.env.PG_PORT) || 5432,
        database: process.env.PG_DATABASE || 'demo',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '',
    },
});

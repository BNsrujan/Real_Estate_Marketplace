import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import propertyRouter from './routes/property.routes.js';
import districtRouter from './routes/district.routes.js';
import watchlistRouter from './routes/watchlist.routes.js';
import enquiryRouter from './routes/enquiry.routes.js';
import { ApiError } from './utils/apiErrors.js';

const app = express();

const rawOrigins = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, mobile apps, same-origin SSR)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
// COOKIE_SECRET must be set in .env — required for tamper-evident signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/districts', districtRouter);
app.use('/api/v1/watchlist', watchlistRouter);
app.use('/api/v1/enquiries', enquiryRouter);

app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }

    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
});

export { app };

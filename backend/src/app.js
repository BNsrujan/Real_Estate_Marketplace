import express from 'express';
import cors from 'cors';

import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import propertyRouter from './routes/property.routes.js';
import districtRouter from './routes/district.routes.js';
import watchlistRouter from './routes/watchlist.routes.js';
import { ApiError } from './utils/apiErrors.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/districts', districtRouter);
app.use('/api/v1/watchlist', watchlistRouter);

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

import { pool } from '../db/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asynHandler.js';

const healthCheck = asyncHandler(async (req, res) => {
    let dbStatus = 'ok';

    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
    } catch {
        dbStatus = 'unreachable';
    }

    const status = dbStatus === 'ok' ? 200 : 503;

    return res.status(status).json(
        new ApiResponse(status, {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: dbStatus,
        }, dbStatus === 'ok' ? 'Healthy' : 'Service Unavailable')
    );
});

export { healthCheck };

import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiErrors.js';

const verifyToken = (req, _res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) throw new ApiError(401, 'Authentication token required');

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch {
        throw new ApiError(401, 'Invalid or expired token');
    }
};

export { verifyToken };

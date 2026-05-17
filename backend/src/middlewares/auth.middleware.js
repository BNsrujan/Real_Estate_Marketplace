import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { ApiError } from '../utils/apiErrors.js';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from '../utils/jwt.helpers.js';
import { parseAuthCookie, setAuthCookie, clearAuthCookie } from '../utils/cookie.helpers.js';
import { createLogger } from '../utils/logger.js';

const refreshLookupColumns = {
    id: users.id,
    email: users.email,
    role: users.role,
    name: users.name,
};

const logger = createLogger('auth.middleware');


const verifyToken = async (req, res, next) => {
    
    const authData = parseAuthCookie(req);

    if (!authData) {
        return next(new ApiError(401, 'Authentication required'));
    }

    const { accessToken, refreshToken } = authData;

    if (!accessToken) {
        return next(new ApiError(401, 'Authentication required'));
    }

    try {
        const payload = verifyAccessToken(accessToken);
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            fullName: authData.fullName,
        };
        req.userId = payload.userId; 

        return next();
    } catch {
        logger.debug('Access token invalid, attempting refresh', {
            reason: err.message,
        });
    }

    
    if (!refreshToken) {
        clearAuthCookie(res);
        return next(new ApiError(401, 'Session expired. Please login again.'));
    }

    try {
        const refreshPayload = verifyRefreshToken(refreshToken);

        const rows = await db
            .select(refreshLookupColumns)
            .from(users)
            .where(eq(users.id, refreshPayload.userId))
            .limit(1);

        if (!rows.length) {
            clearAuthCookie(res);
            return next(new ApiError(401, 'User account not found'));
        }
        const storedHash = u.refreshTokenHash;
         if (!storedHash || storedHash !== incomingHash) {
            await db.update(users).set({ refreshTokenHash: null }).where(eq(users.id, u.id));
            clearAuthCookie(res);
            logger.warn('Refresh token replay detected', { userId: u.id });
            return next(new ApiError(401, 'Session invalidated. Please log in again.'));
        }

        const u = rows[0];
        const tokenPayload = { userId: u.id, email: u.email, role: u.role };
        const newAccessToken = signAccessToken(tokenPayload);
        const newRefreshToken = signRefreshToken(tokenPayload);
        const fullName = u.name ?? u.email;
        
        await db.update(users)
           .set({ refreshTokenHash: hashToken(newRefreshToken) })
           .where(eq(users.id, u.id));

        setAuthCookie(res, {
            fullName,
            email: u.email,
            role: u.role,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

        req.user = { userId: u.id, email: u.email, role: u.role, fullName };
        req.userId = u.id; 

        return next();
    } catch {
        logger.warn('Refresh token verification failed', { reason: err.message });
        clearAuthCookie(res);
        return next(new ApiError(401, 'Session expired. Please login again.'));
    }
};

const requireRole = (...allowedRoles) => (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Insufficient permissions', {
            userId: req.user.userId,
            role: req.user.role,
            required: allowedRoles,
        });
        return next(new ApiError(403, 'Insufficient permissions'));
    }
    return next();
};

export { verifyToken, requireRole };

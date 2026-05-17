import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { ApiError } from '../utils/apiErrors.js';
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken } from '../utils/jwt.helpers.js';
import { parseAuthCookie, setAuthCookie, clearAuthCookie } from '../utils/cookie.helpers.js';

// ─── Minimal user columns needed for token regeneration ──────────────────────

const refreshLookupColumns = {
    id: users.id,
    email: users.email,
    role: users.role,
    name: users.name,
};

// ─── verifyToken middleware ───────────────────────────────────────────────────
//
// Flow:
//   1. Parse auth_session cookie → { accessToken, refreshToken, fullName, email, role }
//   2. Verify accessToken  → valid: attach req.user, proceed
//                         → invalid/expired: fall through to Step 3
//   3. Verify refreshToken → valid: DB lookup → regenerate both tokens → update cookie → attach req.user, proceed
//                         → invalid/expired: clear cookie → 401
//
// Edge cases handled:
//   - Missing cookie                    → 401 Authentication required
//   - Tampered cookie (bad HMAC)        → 401 (cookie-parser sets value to `false`)
//   - Malformed JSON in cookie          → 401 (parseAuthCookie returns null)
//   - Access token valid                → proceed normally
//   - Access token expired              → attempt refresh (transparent to frontend)
//   - Access token invalid/tampered     → attempt refresh
//   - Refresh token absent in cookie    → 401
//   - Refresh token expired             → clear cookie, 401
//   - Refresh token invalid/tampered    → clear cookie, 401
//   - User deleted after token issued   → clear cookie, 401
//   - Role/email changed in DB          → new tokens carry updated values from DB
//   - Concurrent refresh attempts       → each independent request regenerates tokens;
//     last write wins (stateless JWTs — acceptable without token family tracking)

const verifyToken = async (req, res, next) => {
    // ── Step 1: Read cookie ──────────────────────────────────────────────────
    const authData = parseAuthCookie(req);

    if (!authData) {
        return next(new ApiError(401, 'Authentication required'));
    }

    const { accessToken, refreshToken } = authData;

    if (!accessToken) {
        return next(new ApiError(401, 'Authentication required'));
    }

    // ── Step 2: Try access token ─────────────────────────────────────────────
    try {
        const payload = verifyAccessToken(accessToken);

        // Attach full user context; consumers should prefer req.user
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            fullName: authData.fullName,
        };
        req.userId = payload.userId; // backward-compat for existing controllers

        return next();
    } catch {
        // Access token expired or tampered — fall through to refresh path
    }

    // ── Step 3: Try refresh token ────────────────────────────────────────────
    if (!refreshToken) {
        clearAuthCookie(res);
        return next(new ApiError(401, 'Session expired. Please login again.'));
    }

    try {
        const refreshPayload = verifyRefreshToken(refreshToken);

        // DB lookup: verify the user still exists and get fresh role/email
        // (handles revoked accounts, role promotions, email changes)
        const rows = await db
            .select(refreshLookupColumns)
            .from(users)
            .where(eq(users.id, refreshPayload.userId))
            .limit(1);

        if (!rows.length) {
            clearAuthCookie(res);
            return next(new ApiError(401, 'User account not found'));
        }

        const u = rows[0];
        const tokenPayload = { userId: u.id, email: u.email, role: u.role };
        const newAccessToken = signAccessToken(tokenPayload);
        const newRefreshToken = signRefreshToken(tokenPayload);
        const fullName = u.name ?? u.email;

        // Update cookie in place — the response continues seamlessly
        setAuthCookie(res, {
            fullName,
            email: u.email,
            role: u.role,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

        req.user = { userId: u.id, email: u.email, role: u.role, fullName };
        req.userId = u.id; // backward-compat

        return next();
    } catch {
        // Both tokens are invalid/expired — force re-login
        clearAuthCookie(res);
        return next(new ApiError(401, 'Session expired. Please login again.'));
    }
};

// ─── requireRole — optional role guard (use after verifyToken) ───────────────
// Usage: router.get('/admin', verifyToken, requireRole('admin'), handler)

const requireRole = (...allowedRoles) => (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
        return next(new ApiError(403, 'Insufficient permissions'));
    }
    return next();
};

export { verifyToken, requireRole };

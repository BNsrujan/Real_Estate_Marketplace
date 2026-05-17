export const AUTH_COOKIE = 'auth_session';

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCookieOptions = () => ({
    httpOnly: true,
    // In production cookies must be Secure so sameSite:'none' works across origins
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: REFRESH_MAX_AGE_MS,
    // Signed cookies are tamper-evident: cookie-parser verifies HMAC on every read
    signed: true,
});

/**
 * Writes the single unified auth cookie.
 * Shape stored: { fullName, email, role, accessToken, refreshToken }
 */
export const setAuthCookie = (res, { fullName, email, role, accessToken, refreshToken }) => {
    res.cookie(
        AUTH_COOKIE,
        JSON.stringify({ fullName, email, role, accessToken, refreshToken }),
        getCookieOptions(),
    );
};

/**
 * Clears the auth cookie from the client. Call on logout and when both tokens are expired.
 */
export const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE, getCookieOptions());
};

/**
 * Reads and parses the signed auth cookie.
 * Returns the parsed object or null if missing / tampered / malformed.
 *
 * Note: req.signedCookies is populated by cookieParser(COOKIE_SECRET) in app.js.
 * If the HMAC signature is invalid, cookie-parser sets the value to `false` — we treat that as null.
 */
export const parseAuthCookie = (req) => {
    const raw = req.signedCookies?.[AUTH_COOKIE];

    // cookie-parser returns `false` for tampered signed cookies
    if (!raw || raw === false) return null;

    // Express may have auto-deserialized a j:-prefixed cookie into an object already
    if (typeof raw === 'object') return raw;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

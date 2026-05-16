import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Maps contact (email/phone) → { otp, expiry }. Fine for single-instance dev;
// swap for Redis in production.
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const SALT_ROUNDS = 10;

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

const safeUserColumns = {
    id: users.id,
    username: users.username,
    name: users.name,
    email: users.email,
    phone: users.phone,
    avatarUrl: users.avatarUrl,
    role: users.role,
    isVerified: users.isVerified,
    isPro: users.isPro,
    provider: users.provider,
    createdAt: users.createdAt,
};

function buildUserProfile(u) {
    return {
        id: u.id,
        username: u.username,
        name: u.name ?? u.username,
        email: u.email,
        phone: u.phone ?? '',
        avatarUrl: u.avatarUrl ?? null,
        role: u.role,
        isVerified: u.isVerified ?? false,
        isPro: u.isPro ?? false,
        provider: u.provider ?? 'local',
        createdAt: u.createdAt,
    };
}

// Derive a safe unique username from name / email
function deriveUsername(name, email) {
    const base = (name ?? email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 40);
    return `${base}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Register ─────────────────────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
    const { username, name, email, password, phone } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'email and password are required');
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new ApiError(409, 'An account with this email already exists');

    const safeUsername = username?.trim() || deriveUsername(name, email);

    // Check username collision and resolve
    const uConflict = await db.select().from(users).where(eq(users.username, safeUsername)).limit(1);
    const finalUsername = uConflict.length
        ? `${safeUsername}_${Math.random().toString(36).slice(2, 5)}`
        : safeUsername;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db
        .insert(users)
        .values({
            username: finalUsername,
            name: name ?? finalUsername,
            email,
            passwordHash,
            phone: phone ?? null,
            provider: 'local',
        })
        .returning(safeUserColumns);

    const token = signToken(user.id);

    return res.status(201).json(
        new ApiResponse(201, { user: buildUserProfile(user), token }, 'Registered successfully'),
    );
});

// ─── Login ────────────────────────────────────────────────────────────────────

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'email and password are required');

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!rows.length) throw new ApiError(401, 'Invalid credentials');

    const u = rows[0];

    if (!u.passwordHash) {
        throw new ApiError(400, 'This account uses Google Sign-In. Please continue with Google.');
    }

    const match = await bcrypt.compare(password, u.passwordHash);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    const token = signToken(u.id);

    return res.status(200).json(
        new ApiResponse(200, { user: buildUserProfile(u), token }, 'Login successful'),
    );
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    if (!credential) throw new ApiError(400, 'Google credential is required');

    // Verify the ID token with Google's tokeninfo endpoint (no extra package needed)
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const googleRes = await fetch(tokenInfoUrl);

    if (!googleRes.ok) throw new ApiError(401, 'Invalid Google token');

    const payload = await googleRes.json();

    if (payload.error) throw new ApiError(401, `Google token error: ${payload.error_description ?? payload.error}`);

    // Validate the audience matches our client ID (if configured)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
        throw new ApiError(401, 'Google token audience mismatch');
    }

    const { sub: googleId, email, name, picture: avatarUrl, email_verified } = payload;

    if (!email) throw new ApiError(400, 'Google account has no email');

    // Find existing user by googleId OR email
    const rows = await db
        .select()
        .from(users)
        .where(or(eq(users.googleId, googleId), eq(users.email, email)))
        .limit(1);

    let user;

    if (rows.length) {
        // Existing user — link googleId if not already set
        const existing = rows[0];
        if (!existing.googleId) {
            const [updated] = await db
                .update(users)
                .set({ googleId, avatarUrl: existing.avatarUrl ?? avatarUrl ?? null, provider: 'google' })
                .where(eq(users.id, existing.id))
                .returning(safeUserColumns);
            user = updated;
        } else {
            user = existing;
        }
    } else {
        // New user — create account
        const username = deriveUsername(name, email);
        const [created] = await db
            .insert(users)
            .values({
                username,
                name: name ?? username,
                email,
                googleId,
                avatarUrl: avatarUrl ?? null,
                provider: 'google',
                isVerified: email_verified === 'true' || email_verified === true,
            })
            .returning(safeUserColumns);
        user = created;
    }

    const token = signToken(user.id);

    return res.status(200).json(
        new ApiResponse(200, { user: buildUserProfile(user), token }, 'Google sign-in successful'),
    );
});

// ─── Profile ──────────────────────────────────────────────────────────────────

const getProfile = asyncHandler(async (req, res) => {
    const rows = await db
        .select(safeUserColumns)
        .from(users)
        .where(eq(users.id, req.userId))
        .limit(1);

    if (!rows.length) throw new ApiError(404, 'User not found');

    return res.status(200).json(new ApiResponse(200, buildUserProfile(rows[0])));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, avatarUrl } = req.body;

    const [updated] = await db
        .update(users)
        .set({
            ...(name !== undefined && { name }),
            ...(phone !== undefined && { phone }),
            ...(avatarUrl !== undefined && { avatarUrl }),
        })
        .where(eq(users.id, req.userId))
        .returning(safeUserColumns);

    if (!updated) throw new ApiError(404, 'User not found');

    return res.status(200).json(
        new ApiResponse(200, buildUserProfile(updated), 'Profile updated'),
    );
});

// ─── OTP: Send ────────────────────────────────────────────────────────────────

const sendOtp = asyncHandler(async (req, res) => {
    const { contact, type } = req.body;

    if (!contact || !type) throw new ApiError(400, 'contact and type are required');
    if (!['email', 'phone'].includes(type)) throw new ApiError(400, 'type must be "email" or "phone"');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(contact, { otp, expiry: Date.now() + OTP_TTL_MS });

    if (type === 'email') {
        // Use nodemailer if SMTP is configured, otherwise log to console
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const nodemailer = await import('nodemailer');
            const transporter = nodemailer.default.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT ?? 587),
                secure: process.env.SMTP_SECURE === 'true',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            });
            await transporter.sendMail({
                from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
                to: contact,
                subject: 'Your Namma Dharani OTP',
                text: `Your one-time password is: ${otp}\n\nThis code expires in 10 minutes.`,
                html: `<p>Your one-time password is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
            });
        } else {
            // Dev fallback — print to server console
            console.log(`\n[OTP DEV] Email: ${contact}  →  ${otp}\n`);
        }
    } else {
        // SMS — log for now; wire Twilio / Fast2SMS here when ready
        console.log(`\n[OTP DEV] SMS: ${contact}  →  ${otp}\n`);
    }

    return res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
});

// ─── OTP: Verify ──────────────────────────────────────────────────────────────

const verifyOtp = asyncHandler(async (req, res) => {
    const { contact, type, otp } = req.body;

    if (!contact || !otp) throw new ApiError(400, 'contact and otp are required');

    const stored = otpStore.get(contact);
    if (!stored) throw new ApiError(400, 'OTP not found or expired. Please request a new one.');
    if (Date.now() > stored.expiry) {
        otpStore.delete(contact);
        throw new ApiError(400, 'OTP has expired. Please request a new one.');
    }
    if (stored.otp !== otp) throw new ApiError(400, 'Incorrect OTP. Please try again.');

    otpStore.delete(contact);

    const isEmail = type === 'email';

    // Find user by email or phone
    const query = isEmail
        ? eq(users.email, contact)
        : eq(users.phone, contact);

    const rows = await db.select().from(users).where(query).limit(1);
    let user;

    if (rows.length) {
        user = rows[0];
        if (!user.isVerified) {
            const [updated] = await db
                .update(users)
                .set({ isVerified: true })
                .where(eq(users.id, user.id))
                .returning(safeUserColumns);
            user = updated;
        }
    } else {
        // Create a new account from OTP
        const syntheticEmail = isEmail ? contact : `phone_${contact.replace(/\D/g, '')}@namma-dharani.local`;
        const username = deriveUsername(null, syntheticEmail);
        const [created] = await db
            .insert(users)
            .values({
                username,
                name: username,
                email: syntheticEmail,
                phone: isEmail ? null : contact,
                provider: 'otp',
                isVerified: true,
            })
            .returning(safeUserColumns);
        user = created;
    }

    const token = signToken(user.id);

    return res.status(200).json(
        new ApiResponse(200, { user: buildUserProfile(user), token }, 'OTP verified successfully'),
    );
});

export { registerUser, loginUser, googleAuth, getProfile, updateProfile, sendOtp, verifyOtp };

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const SALT_ROUNDS = 10;

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new ApiError(400, 'username, email, and password are required');
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new ApiError(409, 'User with this email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db
        .insert(users)
        .values({ username, email, passwordHash })
        .returning({ id: users.id, username: users.username, email: users.email, role: users.role });

    const token = signToken(user.id);

    return res.status(201).json(new ApiResponse(201, { user, token }, 'Registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'email and password are required');

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!rows.length) throw new ApiError(401, 'Invalid credentials');

    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    const token = signToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json(new ApiResponse(200, { user: safeUser, token }, 'Login successful'));
});

const getProfile = asyncHandler(async (req, res) => {
    const rows = await db
        .select({ id: users.id, username: users.username, email: users.email, role: users.role, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, req.userId))
        .limit(1);

    if (!rows.length) throw new ApiError(404, 'User not found');

    return res.status(200).json(new ApiResponse(200, rows[0]));
});

export { registerUser, loginUser, getProfile };

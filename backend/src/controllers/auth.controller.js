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
        createdAt: u.createdAt,
    };
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, name, email, password } = req.body;

    if (!username || !email || !password) {
        throw new ApiError(400, 'username, email, and password are required');
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new ApiError(409, 'User with this email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db
        .insert(users)
        .values({ username, name: name ?? username, email, passwordHash })
        .returning(safeUserColumns);

    const token = signToken(user.id);

    return res.status(201).json(
        new ApiResponse(201, { user: buildUserProfile(user), token }, 'Registered successfully'),
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) throw new ApiError(400, 'email and password are required');

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!rows.length) throw new ApiError(401, 'Invalid credentials');

    const u = rows[0];
    const match = await bcrypt.compare(password, u.passwordHash);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    const token = signToken(u.id);

    return res.status(200).json(
        new ApiResponse(200, { user: buildUserProfile(u), token }, 'Login successful'),
    );
});

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

export { registerUser, loginUser, getProfile, updateProfile };

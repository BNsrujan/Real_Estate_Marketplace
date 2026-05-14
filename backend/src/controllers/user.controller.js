import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new ApiError(400, 'username, email, and password are required');
    }

    const existing = await User.findByEmail(email);
    if (existing) {
        throw new ApiError(409, 'User with this email already exists');
    }

    const user = await User.create({ username, email, password });

    return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, user));
});

export { registerUser, getUser };

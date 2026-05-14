import { ApiError } from '../utils/apiErrors.js';
import { asyncHandler } from '../utils/asynHandler.js';

const verifyToken = asyncHandler(async (req, _res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        throw new ApiError(401, 'Unauthorized: no token provided');
    }

    // TODO: verify JWT here once jsonwebtoken is added
    next();
});

export { verifyToken };

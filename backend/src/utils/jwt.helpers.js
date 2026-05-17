import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = () => process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = () => process.env.JWT_REFRESH_EXPIRES || '7d';

export const signAccessToken = ({ userId, email, role }) =>
    jwt.sign({ userId, email, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES() });

export const signRefreshToken = ({ userId, email, role }) =>
    jwt.sign({ userId, email, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES() });

export const verifyAccessToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefreshToken = (token) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET);

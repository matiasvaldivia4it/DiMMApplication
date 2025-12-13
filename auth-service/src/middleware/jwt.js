const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            type: 'refresh',
        },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.type === 'refresh') {
        return res.status(401).json({ error: 'Cannot use refresh token for authentication' });
    }

    req.user = decoded;
    next();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    authMiddleware,
};

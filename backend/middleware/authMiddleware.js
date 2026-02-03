const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Staff only middleware (Admin or Librarian)
const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'librarian')) {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Staff only.' });
    }
};

// Check role middleware factory
const checkRole = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
        }
    };
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

module.exports = { protect, adminOnly, staffOnly, checkRole, generateToken };

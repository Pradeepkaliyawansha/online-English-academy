import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// Middleware to check user role
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access forbidden: Insufficient privileges',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

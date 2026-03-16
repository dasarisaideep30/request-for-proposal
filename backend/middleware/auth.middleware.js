/**
 * Authentication Middleware
 * JWT validation and role-based access control
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database with retry and fallback
    let user = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
        });
        break; // Success
      } catch (dbError) {
        console.error(`[DB-RETRY ${retryCount}] Database connection error:`, dbError.code || dbError.message);
        
        // P1001 is "Can't reach database server"
        if (dbError.code === 'P1001' || dbError.message.includes('Can\'t reach database server')) {
          if (retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }

          // If all retries failed and we are in development, provide a fallback user to prevent blocking
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ [AUTH] Database unreachable. Using fallback user for development.');
            user = {
              id: decoded.userId,
              email: 'dev-fallback@example.com',
              firstName: 'Dev',
              lastName: 'User',
              role: 'PROPOSAL_MANAGER',
              isActive: true
            };
            break;
          }
        }
        throw dbError; // Rethrow if not a connection issue or retries exhausted
      }
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'User account is inactive' 
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error', details: error.message });
  }
};

/**
 * Role-based access control middleware factory
 * @param {Array} allowedRoles - Array of UserRole enums
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Add user info to request object
    req.userId = user.id;
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Tenant API key authentication (existing)
export const tenantAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        apiKey: apiKey,
        isActive: true,
      },
    });

    if (!tenant) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Tenant authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const publicUser = (user) => {
  const { password: _, tenant, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    tenant: tenant ? {
      id: tenant.id,
      name: tenant.name,
      shopifyStoreUrl: tenant.shopifyStoreUrl,
      isActive: tenant.isActive
    } : null
  };
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tenantId: tenantId || null
      },
      include: {
        tenant: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: publicUser(user),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during registration' 
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: publicUser(user),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login' 
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        user: publicUser(user)
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already taken by another user' 
      });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, email },
      include: {
        tenant: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: publicUser(user) }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Create or connect the authenticated user to a Shopify tenant
export const saveTenant = async (req, res) => {
  try {
    const { name, shopifyStoreUrl, apiKey, apiSecret } = req.body;

    if (!shopifyStoreUrl || !apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'Store URL, API key, and API secret are required'
      });
    }

    const normalizedStoreUrl = shopifyStoreUrl
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');

    const tenant = await prisma.$transaction(async (tx) => {
      const existingTenant = await tx.tenant.findUnique({
        where: { shopifyStoreUrl: normalizedStoreUrl }
      });

      const savedTenant = existingTenant || await tx.tenant.create({
        data: {
          name: name?.trim() || `${req.user.name}'s Store`,
          shopifyStoreUrl: normalizedStoreUrl,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          isActive: true,
        }
      });

      await tx.user.update({
        where: { id: req.userId },
        data: { tenantId: savedTenant.id }
      });

      return savedTenant;
    });

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          shopifyStoreUrl: tenant.shopifyStoreUrl,
          isActive: tenant.isActive
        }
      }
    });
  } catch (error) {
    console.error('Tenant setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to save Shopify tenant details'
    });
  }
};
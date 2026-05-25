import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Database } from '../data/db';
import { JWT_SECRET } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  const { userId, password, role } = req.body;

  if (!userId || !password || !role) {
    return res.status(400).json({ message: 'User ID, Password, and Role are required.' });
  }

  try {
    const user = Database.getUserByUserId(userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Verify role selection matches database role
    if (user.role !== role) {
      return res.status(401).json({ 
        message: `Role mismatch. This account is registered as '${user.role}' but you selected '${role}'.` 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        userId: user.userId,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return token and user details
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        status: user.status,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

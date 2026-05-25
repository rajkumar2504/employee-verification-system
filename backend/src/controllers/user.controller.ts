import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Database } from '../data/db';

const ARTIFICIAL_DELAY_MS = 2500;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await delay(ARTIFICIAL_DELAY_MS);
    const users = Database.getUsers();
    
    // For security, remove passwords before sending lists
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    return res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error retrieving user records.' });
  }
};

// Create a new user (Admin only)
export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId, name, role, status, email, phone, department, joinedDate, comments, password } = req.body;

  if (!userId || !name || !role || !status || !email) {
    return res.status(400).json({ message: 'Required fields: userId, name, role, status, email' });
  }

  try {
    await delay(ARTIFICIAL_DELAY_MS);
    
    // Check if user already exists
    const existing = Database.getUserByUserId(userId);
    if (existing) {
      return res.status(400).json({ message: `A user with User ID '${userId}' already exists.` });
    }

    const newUser = Database.createUser({
      userId,
      name,
      role,
      status,
      email,
      phone: phone || '',
      department: department || 'General',
      joinedDate: joinedDate || new Date().toISOString().split('T')[0],
      comments: comments || '',
      password: password || 'user123'
    });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user record.' });
  }
};

// Update an existing user (Admin only)
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return res.status(400).json({ message: 'Invalid User ID format.' });
  }

  try {
    await delay(ARTIFICIAL_DELAY_MS);
    
    // Check if user exists
    const existing = Database.getUserById(numId);
    if (!existing) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if updating userId and if it conflicts
    if (req.body.userId && req.body.userId.toLowerCase() !== existing.userId.toLowerCase()) {
      const conflict = Database.getUserByUserId(req.body.userId);
      if (conflict) {
        return res.status(400).json({ message: `A user with User ID '${req.body.userId}' already exists.` });
      }
    }

    const updatedUser = Database.updateUser(numId, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User could not be updated.' });
    }

    const { password: _, ...safeUser } = updatedUser;
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user record.' });
  }
};

// Delete a user (Admin only)
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return res.status(400).json({ message: 'Invalid User ID format.' });
  }

  try {
    await delay(ARTIFICIAL_DELAY_MS);
    
    // Don't allow admin to delete themselves if they are the current logged-in user
    if (req.user && req.user.id === numId) {
      return res.status(400).json({ message: 'Self-deletion is forbidden. You cannot delete your own admin account.' });
    }

    const deleted = Database.deleteUser(numId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found or could not be deleted.' });
    }

    return res.status(200).json({ success: true, message: 'User record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user record.' });
  }
};

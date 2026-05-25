import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();

// GET /users - accessible by any authenticated user (General User or Admin)
router.get('/', authenticateJWT, getAllUsers);

// POST /users - Admin only
router.post('/', authenticateJWT, authorizeRoles('Admin'), createUser);

// PUT /users/:id - Admin only
router.put('/:id', authenticateJWT, authorizeRoles('Admin'), updateUser);

// DELETE /users/:id - Admin only
router.delete('/:id', authenticateJWT, authorizeRoles('Admin'), deleteUser);

export default router;

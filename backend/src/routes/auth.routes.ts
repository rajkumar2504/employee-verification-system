import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/login (or just POST /login as requested)
router.post('/login', login);

export default router;

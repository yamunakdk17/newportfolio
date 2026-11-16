import { Router } from 'express';
import { loginController, logoutController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginController);
router.post('/logout', requireAuth, logoutController);

export default router;

import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', getDashboardStats);

export default router;
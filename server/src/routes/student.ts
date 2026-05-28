import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import * as studentController from '../controllers/studentController';

const router = Router();

// All student routes require student auth
router.use(authMiddleware, roleMiddleware('student'));

router.get('/profile', studentController.getProfile);
router.get('/points/overview', studentController.getPointsOverview);
router.post('/point-applications', studentController.submitApplication);
router.get('/point-applications', studentController.getMyApplications);
router.get('/point-records', studentController.getMyPointRecords);
router.get('/resources', studentController.getResources);
router.get('/resources/:id', studentController.getResourceDetail);
router.post('/exchange-orders', studentController.createExchangeOrder);
router.get('/exchange-orders', studentController.getMyExchangeOrders);

export default router;

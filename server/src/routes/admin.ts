import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

// All admin routes require admin auth
router.use(authMiddleware, roleMiddleware('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Students
router.get('/students', adminController.getStudents);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.patch('/students/:id/status', adminController.toggleStudentStatus);
router.post('/students/:id/manual-points', adminController.manualPoints);

// Applications
router.get('/point-applications', adminController.getApplications);
router.post('/point-applications/:id/review', adminController.reviewApplication);

// Point Records
router.get('/point-records', adminController.getPointRecords);

// Resources
router.get('/resources', adminController.getAdminResources);
router.post('/resources', adminController.createResource);
router.put('/resources/:id', adminController.updateResource);
router.patch('/resources/:id/status', adminController.toggleResourceStatus);

// Exchange Orders
router.get('/exchange-orders', adminController.getExchangeOrders);
router.post('/exchange-orders/:id/process', adminController.processExchangeOrder);

// Operation Logs
router.get('/operation-logs', adminController.getOperationLogs);

export default router;

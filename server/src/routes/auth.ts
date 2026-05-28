import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/student/login', authController.studentLogin);
router.post('/admin/login', authController.adminLogin);

export default router;

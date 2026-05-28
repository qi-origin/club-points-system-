import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as studentService from '../services/studentService';

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const profile = await studentService.getProfile(req.user!.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getPointsOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const overview = await studentService.getPointsOverview(req.user!.id);
    res.json(overview);
  } catch (err) {
    next(err);
  }
}

export async function submitApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { taskRuleId, taskDescription, pointsApplied, idempotencyKey } = req.body;
    if (!idempotencyKey) {
      res.status(400).json({ error: '缺少幂等键' });
      return;
    }
    const application = await studentService.submitApplication(req.user!.id, {
      taskRuleId,
      taskDescription,
      pointsApplied: Number(pointsApplied),
      evidenceUrl: req.body.evidenceUrl || null,
      idempotencyKey,
    });
    res.json(application);
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const status = req.query.status ? Number(req.query.status) : undefined;
    const result = await studentService.getMyApplications(req.user!.id, page, pageSize, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyPointRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const result = await studentService.getMyPointRecords(req.user!.id, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getResources(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await studentService.getResources(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getResourceDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resource = await studentService.getResourceDetail(Number(req.params.id));
    res.json(resource);
  } catch (err) {
    next(err);
  }
}

export async function createExchangeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { resourceId, idempotencyKey } = req.body;
    if (!idempotencyKey) {
      res.status(400).json({ error: '缺少幂等键' });
      return;
    }
    const order = await studentService.createExchangeOrder(req.user!.id, {
      resourceId: Number(resourceId),
      idempotencyKey,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function getMyExchangeOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await studentService.getMyExchangeOrders(req.user!.id, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

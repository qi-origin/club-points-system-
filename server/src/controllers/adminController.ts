import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import * as adminService from '../services/adminService';
import prisma from '../utils/prisma';

// ─── Students ───────────────────────────────────────────

export async function getStudents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getStudents({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      keyword: req.query.keyword as string | undefined,
      status: req.query.status ? Number(req.query.status) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const student = await adminService.createStudent(req.body);
    await prisma.operationLog.create({
      data: {
        adminId: req.user!.id,
        action: 'create_student',
        targetType: 'student',
        targetId: student.id,
        detail: JSON.stringify({ name: student.name, studentNo: student.studentNo }),
        ip: req.ip || null,
      },
    });
    res.json(student);
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const student = await adminService.updateStudent(Number(req.params.id), req.body);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

export async function toggleStudentStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const student = await adminService.toggleStudentStatus(
      Number(req.params.id),
      req.body.status
    );
    await prisma.operationLog.create({
      data: {
        adminId: req.user!.id,
        action: 'toggle_student',
        targetType: 'student',
        targetId: student.id,
        detail: JSON.stringify({ status: student.status }),
        ip: req.ip || null,
      },
    });
    res.json(student);
  } catch (err) {
    next(err);
  }
}

// ─── Applications ────────────────────────────────────────

export async function getApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getApplications({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status ? Number(req.query.status) : undefined,
      studentId: req.query.studentId ? Number(req.query.studentId) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function reviewApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { action, comment } = req.body;
    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ error: '无效的审核操作' });
      return;
    }
    const result = await adminService.reviewApplication(
      Number(req.params.id),
      req.user!.id,
      { action, comment },
      req.ip
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Manual Points ───────────────────────────────────────

export async function manualPoints(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { type, amount, remark } = req.body;
    if (!type || !['earn', 'spend'].includes(type)) {
      res.status(400).json({ error: '无效的积分操作类型' });
      return;
    }
    const result = await adminService.manualPoints(
      Number(req.params.id),
      req.user!.id,
      { type, amount: Number(amount), remark },
      req.ip
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Point Records ───────────────────────────────────────

export async function getPointRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getPointRecords({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      studentId: req.query.studentId ? Number(req.query.studentId) : undefined,
      type: req.query.type as string | undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Resources ───────────────────────────────────────────

export async function createResource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resource = await adminService.createResource(req.body);
    await prisma.operationLog.create({
      data: {
        adminId: req.user!.id,
        action: 'create_resource',
        targetType: 'resource',
        targetId: resource.id,
        detail: JSON.stringify({ name: resource.name, pointsRequired: resource.pointsRequired }),
        ip: req.ip || null,
      },
    });
    res.json(resource);
  } catch (err) {
    next(err);
  }
}

export async function updateResource(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resource = await adminService.updateResource(Number(req.params.id), req.body);
    res.json(resource);
  } catch (err) {
    next(err);
  }
}

export async function toggleResourceStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resource = await adminService.toggleResourceStatus(
      Number(req.params.id),
      req.body.status
    );
    res.json(resource);
  } catch (err) {
    next(err);
  }
}

export async function getAdminResources(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getAdminResources({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status ? Number(req.query.status) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Exchange Orders ─────────────────────────────────────

export async function getExchangeOrders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getExchangeOrders({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status ? Number(req.query.status) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function processExchangeOrder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { action, cancelReason } = req.body;
    if (!action || !['complete', 'cancel'].includes(action)) {
      res.status(400).json({ error: '无效的处理操作' });
      return;
    }
    if (action === 'cancel' && !cancelReason) {
      res.status(400).json({ error: '取消订单请填写原因' });
      return;
    }
    const result = await adminService.processExchangeOrder(
      Number(req.params.id),
      req.user!.id,
      { action, cancelReason },
      req.ip
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Operation Logs ──────────────────────────────────────

export async function getOperationLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getOperationLogs({
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 20,
      adminId: req.query.adminId ? Number(req.query.adminId) : undefined,
      action: req.query.action as string | undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ─── Dashboard ───────────────────────────────────────────

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

import prisma from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

export async function getProfile(studentId: number) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError(404, '学生不存在');
  return student;
}

export async function getPointsOverview(studentId: number) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError(404, '学生不存在');

  const pending = await prisma.pointApplication.aggregate({
    where: { studentId, status: 0 },
    _sum: { pointsApplied: true },
  });

  return {
    currentPoints: student.totalEarned - student.totalSpent,
    totalEarned: student.totalEarned,
    totalSpent: student.totalSpent,
    pendingPoints: pending._sum.pointsApplied || 0,
  };
}

export async function submitApplication(
  studentId: number,
  data: {
    taskRuleId?: number;
    taskDescription: string;
    pointsApplied: number;
    evidenceUrl?: string;
    idempotencyKey: string;
  }
) {
  if (!data.taskDescription.trim()) {
    throw new AppError(400, '请填写任务描述');
  }
  if (data.pointsApplied <= 0) {
    throw new AppError(400, '积分必须大于 0');
  }

  // Check idempotency
  const existing = await prisma.pointApplication.findUnique({
    where: { idempotencyKey: data.idempotencyKey },
  });
  if (existing) {
    return existing;
  }

  return prisma.pointApplication.create({
    data: {
      studentId,
      taskRuleId: data.taskRuleId || null,
      taskDescription: data.taskDescription,
      pointsApplied: data.pointsApplied,
      evidenceUrl: data.evidenceUrl || null,
      idempotencyKey: data.idempotencyKey,
    },
  });
}

export async function getMyApplications(
  studentId: number,
  page: number,
  pageSize: number,
  status?: number
) {
  const where: any = { studentId };
  if (status !== undefined && status !== null) {
    where.status = Number(status);
  }

  const [list, total] = await Promise.all([
    prisma.pointApplication.findMany({
      where,
      include: {
        taskRule: { select: { name: true, points: true } },
        reviewer: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pointApplication.count({ where }),
  ]);

  return { list, total, page, pageSize };
}

export async function getMyPointRecords(
  studentId: number,
  page: number,
  pageSize: number
) {
  const where = { studentId };

  const [list, total] = await Promise.all([
    prisma.pointRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pointRecord.count({ where }),
  ]);

  return { list, total, page, pageSize };
}

export async function getResources(page: number, pageSize: number) {
  const where = { status: 1, stock: { gt: 0 } };

  const [list, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  return { list, total, page, pageSize };
}

export async function getResourceDetail(resourceId: number) {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) throw new AppError(404, '资源不存在');
  return resource;
}

export async function createExchangeOrder(
  studentId: number,
  data: { resourceId: number; idempotencyKey: string }
) {
  // Check idempotency
  const existing = await prisma.exchangeOrder.findUnique({
    where: { idempotencyKey: data.idempotencyKey },
  });
  if (existing) {
    const resource = await prisma.resource.findUnique({ where: { id: existing.resourceId } });
    return { ...existing, resourceName: resource?.name };
  }

  // Use a transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // Lock and check resource
    const resource = await tx.resource.findUnique({ where: { id: data.resourceId } });
    if (!resource) throw new AppError(404, '资源不存在');
    if (resource.status !== 1) throw new AppError(400, '该资源已下架');
    if (resource.stock <= 0) throw new AppError(400, '库存不足');

    // Lock and check student points
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError(404, '学生不存在');

    const currentPoints = student.totalEarned - student.totalSpent;
    if (currentPoints < resource.pointsRequired) {
      throw new AppError(400, '积分不足');
    }

    // Deduct stock (optimistic lock via version)
    const stockResult = await tx.resource.updateMany({
      where: { id: resource.id, version: resource.version },
      data: { stock: { decrement: 1 }, version: { increment: 1 } },
    });
    if (stockResult.count === 0) {
      throw new AppError(409, '资源库存变动，请刷新后重试');
    }

    // Create order
    const order = await tx.exchangeOrder.create({
      data: {
        studentId,
        resourceId: data.resourceId,
        pointsCost: resource.pointsRequired,
        idempotencyKey: data.idempotencyKey,
      },
    });

    // Deduct points
    const newBalance = currentPoints - resource.pointsRequired;
    await tx.student.update({
      where: { id: studentId },
      data: { totalSpent: { increment: resource.pointsRequired } },
    });

    // Write point record
    await tx.pointRecord.create({
      data: {
        studentId,
        type: 'spend',
        amount: resource.pointsRequired,
        balanceAfter: newBalance,
        sourceType: 'exchange',
        sourceId: order.id,
        remark: `兑换: ${resource.name}`,
      },
    });

    return { ...order, resourceName: resource.name };
  });
}

export async function getMyExchangeOrders(
  studentId: number,
  page: number,
  pageSize: number
) {
  const where = { studentId };

  const [list, total] = await Promise.all([
    prisma.exchangeOrder.findMany({
      where,
      include: { resource: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.exchangeOrder.count({ where }),
  ]);

  const mapped = list.map((o) => ({
    id: o.id,
    resourceName: o.resource.name,
    pointsCost: o.pointsCost,
    status: o.status,
    cancelReason: o.cancelReason,
    createdAt: o.createdAt,
  }));

  return { list: mapped, total, page, pageSize };
}

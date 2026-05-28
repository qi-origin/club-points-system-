import prisma from '../utils/prisma';
import { AppError } from '../middlewares/errorHandler';

// ─── Students ───────────────────────────────────────────

export async function getStudents(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: number;
}) {
  const where: any = {};
  if (params.keyword) {
    where.OR = [
      { name: { contains: params.keyword } },
      { studentNo: { contains: params.keyword } },
    ];
  }
  if (params.status !== undefined && params.status !== null) {
    where.status = Number(params.status);
  }

  const [list, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return { list, total, page: params.page, pageSize: params.pageSize };
}

export async function createStudent(data: { name: string; studentNo: string }) {
  if (!data.name.trim()) throw new AppError(400, '姓名不能为空');
  if (!data.studentNo.trim()) throw new AppError(400, '学号不能为空');

  const existing = await prisma.student.findUnique({ where: { studentNo: data.studentNo } });
  if (existing) throw new AppError(400, '该学号已存在');

  return prisma.student.create({ data: { name: data.name, studentNo: data.studentNo } });
}

export async function updateStudent(id: number, data: { name: string; studentNo: string }) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new AppError(404, '学生不存在');

  if (data.studentNo !== student.studentNo) {
    const dup = await prisma.student.findUnique({ where: { studentNo: data.studentNo } });
    if (dup) throw new AppError(400, '该学号已被其他学生使用');
  }

  return prisma.student.update({
    where: { id },
    data: { name: data.name, studentNo: data.studentNo },
  });
}

export async function toggleStudentStatus(id: number, status: number) {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new AppError(404, '学生不存在');
  return prisma.student.update({ where: { id }, data: { status } });
}

// ─── Point Application Review ────────────────────────────

export async function reviewApplication(
  applicationId: number,
  adminId: number,
  data: { action: 'approve' | 'reject'; comment?: string },
  ip?: string
) {
  return prisma.$transaction(async (tx) => {
    const app = await tx.pointApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new AppError(404, '申请不存在');
    if (app.status !== 0) throw new AppError(400, '该申请已审核，请勿重复操作');

    const newStatus = data.action === 'approve' ? 1 : 2;

    await tx.pointApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewerId: adminId,
        reviewComment: data.comment || null,
        reviewedAt: new Date(),
      },
    });

    // If approved: add points + write record
    if (data.action === 'approve') {
      const student = await tx.student.findUnique({ where: { id: app.studentId } });
      if (!student) throw new AppError(404, '学生不存在');

      const newBalance = student.totalEarned - student.totalSpent + app.pointsApplied;

      await tx.student.update({
        where: { id: app.studentId },
        data: { totalEarned: { increment: app.pointsApplied } },
      });

      await tx.pointRecord.create({
        data: {
          studentId: app.studentId,
          type: 'earn',
          amount: app.pointsApplied,
          balanceAfter: newBalance,
          sourceType: 'application',
          sourceId: app.id,
          operatorId: adminId,
          remark: '任务积分审核通过',
        },
      });
    }

    // Operation log
    await tx.operationLog.create({
      data: {
        adminId,
        action: data.action,
        targetType: 'application',
        targetId: app.id,
        detail: JSON.stringify({
          studentId: app.studentId,
          points: app.pointsApplied,
          comment: data.comment || '',
        }),
        ip: ip || null,
      },
    });

    return { success: true };
  });
}

// ─── Manual Points ───────────────────────────────────────

export async function manualPoints(
  studentId: number,
  adminId: number,
  data: { type: 'earn' | 'spend'; amount: number; remark: string },
  ip?: string
) {
  if (data.amount <= 0) throw new AppError(400, '积分数量必须大于 0');
  if (!data.remark.trim()) throw new AppError(400, '请填写备注说明');

  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError(404, '学生不存在');

    const currentPoints = student.totalEarned - student.totalSpent;

    if (data.type === 'spend' && currentPoints < data.amount) {
      throw new AppError(400, '学生积分不足，无法扣分');
    }

    const newBalance =
      data.type === 'earn' ? currentPoints + data.amount : currentPoints - data.amount;

    if (data.type === 'earn') {
      await tx.student.update({
        where: { id: studentId },
        data: { totalEarned: { increment: data.amount } },
      });
    } else {
      await tx.student.update({
        where: { id: studentId },
        data: { totalSpent: { increment: data.amount } },
      });
    }

    await tx.pointRecord.create({
      data: {
        studentId,
        type: data.type,
        amount: data.amount,
        balanceAfter: newBalance,
        sourceType: 'manual',
        sourceId: null,
        operatorId: adminId,
        remark: data.remark,
      },
    });

    await tx.operationLog.create({
      data: {
        adminId,
        action: data.type === 'earn' ? 'manual_add' : 'manual_deduct',
        targetType: 'student',
        targetId: studentId,
        detail: JSON.stringify({ amount: data.amount, remark: data.remark }),
        ip: ip || null,
      },
    });

    return { success: true };
  });
}

// ─── Point Records ───────────────────────────────────────

export async function getPointRecords(params: {
  studentId?: number;
  type?: string;
  page: number;
  pageSize: number;
}) {
  const where: any = {};
  if (params.studentId) where.studentId = Number(params.studentId);
  if (params.type) where.type = params.type;

  const [list, total] = await Promise.all([
    prisma.pointRecord.findMany({
      where,
      include: {
        student: { select: { name: true, studentNo: true } },
        operator: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.pointRecord.count({ where }),
  ]);

  const mapped = list.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.name,
    studentNo: r.student.studentNo,
    type: r.type,
    amount: r.amount,
    balanceAfter: r.balanceAfter,
    sourceType: r.sourceType,
    sourceId: r.sourceId,
    remark: r.remark,
    operatorName: r.operator?.username || null,
    createdAt: r.createdAt,
  }));

  return { list: mapped, total, page: params.page, pageSize: params.pageSize };
}

// ─── Applications (admin view) ───────────────────────────

export async function getApplications(params: {
  status?: number;
  studentId?: number;
  page: number;
  pageSize: number;
}) {
  const where: any = {};
  if (params.status !== undefined && params.status !== null) {
    where.status = Number(params.status);
  }
  if (params.studentId) where.studentId = Number(params.studentId);

  const [list, total] = await Promise.all([
    prisma.pointApplication.findMany({
      where,
      include: {
        student: { select: { name: true, studentNo: true } },
        taskRule: { select: { name: true, points: true } },
        reviewer: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.pointApplication.count({ where }),
  ]);

  return { list, total, page: params.page, pageSize: params.pageSize };
}

// ─── Resources ───────────────────────────────────────────

export async function createResource(data: {
  name: string;
  description?: string;
  pointsRequired: number;
  stock: number;
  imageUrl?: string;
}) {
  if (!data.name.trim()) throw new AppError(400, '资源名称不能为空');
  if (data.pointsRequired <= 0) throw new AppError(400, '兑换积分必须大于 0');
  if (data.stock < 0) throw new AppError(400, '库存不能为负数');

  return prisma.resource.create({
    data: {
      name: data.name,
      description: data.description || null,
      pointsRequired: data.pointsRequired,
      stock: data.stock,
      totalStock: data.stock,
      imageUrl: data.imageUrl || null,
    },
  });
}

export async function updateResource(
  id: number,
  data: {
    name: string;
    description?: string;
    pointsRequired: number;
    stock: number;
    imageUrl?: string;
  }
) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw new AppError(404, '资源不存在');

  // Recalculate stock delta
  const stockDelta = data.stock - resource.stock;

  return prisma.resource.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      pointsRequired: data.pointsRequired,
      stock: data.stock,
      totalStock: resource.totalStock + stockDelta,
      imageUrl: data.imageUrl || null,
    },
  });
}

export async function toggleResourceStatus(id: number, status: number) {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw new AppError(404, '资源不存在');
  return prisma.resource.update({ where: { id }, data: { status } });
}

export async function getAdminResources(params: { page: number; pageSize: number; status?: number }) {
  const where: any = {};
  if (params.status !== undefined && params.status !== null) {
    where.status = Number(params.status);
  }

  const [list, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  return { list, total, page: params.page, pageSize: params.pageSize };
}

// ─── Exchange Orders ─────────────────────────────────────

export async function getExchangeOrders(params: {
  status?: number;
  page: number;
  pageSize: number;
}) {
  const where: any = {};
  if (params.status !== undefined && params.status !== null) {
    where.status = Number(params.status);
  }

  const [list, total] = await Promise.all([
    prisma.exchangeOrder.findMany({
      where,
      include: {
        student: { select: { name: true, studentNo: true } },
        resource: { select: { name: true } },
        handler: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.exchangeOrder.count({ where }),
  ]);

  return { list, total, page: params.page, pageSize: params.pageSize };
}

export async function processExchangeOrder(
  orderId: number,
  adminId: number,
  data: { action: 'complete' | 'cancel'; cancelReason?: string },
  ip?: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.exchangeOrder.findUnique({
      where: { id: orderId },
      include: { resource: true },
    });
    if (!order) throw new AppError(404, '订单不存在');
    if (order.status !== 0) throw new AppError(400, '该订单已处理，请勿重复操作');

    if (data.action === 'complete') {
      // Complete: just mark status (points already deducted at order creation)
      await tx.exchangeOrder.update({
        where: { id: orderId },
        data: { status: 1, handlerId: adminId, handledAt: new Date() },
      });
    } else {
      // Cancel: refund stock + refund points
      await tx.exchangeOrder.update({
        where: { id: orderId },
        data: {
          status: 2,
          handlerId: adminId,
          handledAt: new Date(),
          cancelReason: data.cancelReason || null,
        },
      });

      // Return stock
      await tx.resource.update({
        where: { id: order.resourceId },
        data: { stock: { increment: 1 } },
      });

      // Return points
      const student = await tx.student.findUnique({ where: { id: order.studentId } });
      if (student) {
        const newBalance = student.totalEarned - student.totalSpent + order.pointsCost;

        await tx.student.update({
          where: { id: order.studentId },
          data: { totalSpent: { decrement: order.pointsCost } },
        });

        await tx.pointRecord.create({
          data: {
            studentId: order.studentId,
            type: 'refund',
            amount: order.pointsCost,
            balanceAfter: newBalance,
            sourceType: 'exchange_cancel',
            sourceId: order.id,
            operatorId: adminId,
            remark: `兑换取消退回: ${order.resource.name}`,
          },
        });
      }
    }

    // Operation log
    await tx.operationLog.create({
      data: {
        adminId,
        action: data.action === 'complete' ? 'handle_order' : 'cancel_order',
        targetType: 'order',
        targetId: order.id,
        detail: JSON.stringify({
          action: data.action,
          cancelReason: data.cancelReason || '',
          studentId: order.studentId,
          resourceId: order.resourceId,
          pointsCost: order.pointsCost,
        }),
        ip: ip || null,
      },
    });

    return { success: true };
  });
}

// ─── Operation Logs ──────────────────────────────────────

export async function getOperationLogs(params: {
  adminId?: number;
  action?: string;
  page: number;
  pageSize: number;
}) {
  const where: any = {};
  if (params.adminId) where.adminId = Number(params.adminId);
  if (params.action) where.action = params.action;

  const [list, total] = await Promise.all([
    prisma.operationLog.findMany({
      where,
      include: { admin: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.operationLog.count({ where }),
  ]);

  return { list, total, page: params.page, pageSize: params.pageSize };
}

// ─── Dashboard ───────────────────────────────────────────

export async function getDashboard() {
  const [
    studentCount,
    totalPointsEarned,
    totalPointsSpent,
    pendingApplications,
    pendingOrders,
    totalResources,
    recentLogs,
  ] = await Promise.all([
    prisma.student.count({ where: { status: 1 } }),
    prisma.student.aggregate({ _sum: { totalEarned: true } }),
    prisma.student.aggregate({ _sum: { totalSpent: true } }),
    prisma.pointApplication.count({ where: { status: 0 } }),
    prisma.exchangeOrder.count({ where: { status: 0 } }),
    prisma.resource.count({ where: { status: 1 } }),
    prisma.operationLog.findMany({
      include: { admin: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    studentCount,
    totalPointsEarned: totalPointsEarned._sum.totalEarned || 0,
    totalPointsSpent: totalPointsSpent._sum.totalSpent || 0,
    pendingApplications,
    pendingOrders,
    totalResources,
    recentLogs,
  };
}

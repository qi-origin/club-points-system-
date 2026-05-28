import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

export async function studentLogin(name: string, studentNo: string) {
  const student = await prisma.student.findUnique({ where: { studentNo } });

  if (!student || student.name !== name) {
    throw new AppError(401, '姓名或学号错误');
  }

  if (student.status === 0) {
    throw new AppError(403, '账号已被禁用，请联系管理员');
  }

  const token = signToken({ id: student.id, role: 'student' });

  return {
    token,
    student: {
      id: student.id,
      name: student.name,
      studentNo: student.studentNo,
      totalEarned: student.totalEarned,
      totalSpent: student.totalSpent,
    },
  };
}

export async function adminLogin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    throw new AppError(401, '用户名或密码错误');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AppError(401, '用户名或密码错误');
  }

  if (admin.status === 0) {
    throw new AppError(403, '账号已被禁用');
  }

  const token = signToken({ id: admin.id, role: 'admin' });

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
  };
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('xql1234', 10);

  // Find old default admin
  const oldAdmin = await prisma.admin.findUnique({ where: { username: 'admin' } });

  // Create or update the real admin
  const realAdmin = await prisma.admin.upsert({
    where: { username: '夏乾龙' },
    update: { passwordHash, role: 'super_admin' },
    create: {
      username: '夏乾龙',
      passwordHash,
      role: 'super_admin',
    },
  });

  // Migrate records from old admin to new admin (if old admin exists and is different)
  if (oldAdmin && oldAdmin.id !== realAdmin.id) {
    await prisma.operationLog.updateMany({ where: { adminId: oldAdmin.id }, data: { adminId: realAdmin.id } });
    await prisma.pointApplication.updateMany({ where: { reviewerId: oldAdmin.id }, data: { reviewerId: realAdmin.id } });
    await prisma.pointRecord.updateMany({ where: { operatorId: oldAdmin.id }, data: { operatorId: realAdmin.id } });
    await prisma.exchangeOrder.updateMany({ where: { handlerId: oldAdmin.id }, data: { handlerId: realAdmin.id } });
    await prisma.admin.delete({ where: { id: oldAdmin.id } });
  }

  // Remove test students
  await prisma.student.deleteMany({
    where: { studentNo: { in: ['2024001', '2024002', '2024003'] } },
  });

  // Remove old sample task rules
  await prisma.taskRule.deleteMany({
    where: { id: { in: [1, 2, 3] } },
  });

  console.log('Seed completed: admin=' + realAdmin.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

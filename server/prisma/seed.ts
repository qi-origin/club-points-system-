import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'super_admin',
    },
  });

  // Create sample task rules (placeholder — admin fills in real ones)
  const tasks = [
    { name: '社团公众号推文转发', points: 5, description: '转发指定推文至朋友圈并截图' },
    { name: '活动志愿者', points: 10, description: '参与社团活动的组织与执行工作' },
    { name: '社团宣传素材制作', points: 15, description: '制作海报、视频等宣传素材' },
  ];

  for (const task of tasks) {
    await prisma.taskRule.upsert({
      where: { id: tasks.indexOf(task) + 1 },
      update: {},
      create: task,
    });
  }

  // Create sample students for testing
  const sampleStudents = [
    { name: '张三', studentNo: '2024001' },
    { name: '李四', studentNo: '2024002' },
    { name: '王五', studentNo: '2024003' },
  ];

  for (const s of sampleStudents) {
    await prisma.student.upsert({
      where: { studentNo: s.studentNo },
      update: {},
      create: s,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

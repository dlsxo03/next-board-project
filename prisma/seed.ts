import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin1234', 10);
  
  // 관리자 계정 생성
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      nickname: '관리자',
      role: 'ADMIN',
    },
  });
  
  console.log({ admin });
  
  // 테스트 사용자 계정 생성
  const userPassword = await bcrypt.hash('user1234', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      nickname: '일반사용자',
      role: 'USER',
    },
  });
  
  console.log({ user });
  
  // 샘플 공지사항 생성
  const notice = await prisma.notice.create({
    data: {
      title: '환영합니다!',
      content: 'Next Board 서비스에 오신 것을 환영합니다. 많은 이용 부탁드립니다.',
      authorId: admin.id,
      isPinned: true,
    },
  });
  
  console.log({ notice });
  
  // 샘플 게시글 생성
  const post = await prisma.post.create({
    data: {
      title: '첫 번째 게시글입니다',
      content: '게시판의 첫 번째 게시글입니다. 반갑습니다!',
      authorId: user.id,
      category: '일반',
    },
  });
  
  console.log({ post });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
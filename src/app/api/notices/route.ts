import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 공지사항 생성 API
export async function POST(request: NextRequest) {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 관리자만 공지사항 작성 가능
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '관리자만 공지사항을 작성할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 요청 본문에서 데이터 가져오기
    const { title, content, isPinned } = await request.json();

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 공지사항 생성
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isPinned: isPinned || false,
        authorId: currentUser.id,
      },
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    return NextResponse.json(
      { message: '공지사항 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 공지사항 목록 조회 API
export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            nickname: true
          }
        }
      }
    });
    
    return NextResponse.json(notices);
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json(
      { message: '공지사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
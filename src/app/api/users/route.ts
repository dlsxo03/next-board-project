import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 전체 사용자 목록 조회 API (관리자만 가능)
export async function GET() {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 관리자 권한 확인
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '관리자만 접근할 수 있는 기능입니다.' },
        { status: 403 }
      );
    }
    
    // 모든 사용자 정보 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json(
      { message: '사용자 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
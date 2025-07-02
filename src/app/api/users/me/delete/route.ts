import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

// 회원 탈퇴 API
export async function POST(request: NextRequest) {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 로그인하지 않은 경우
    if (!currentUser) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }
    
    // 요청 본문에서 비밀번호 가져오기
    const { password } = await request.json();
    
    // 비밀번호 검증
    if (!password) {
      return NextResponse.json(
        { message: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // 사용자의 모든 데이터 삭제 (관계 데이터는 CASCADE로 처리됨)
    await prisma.user.delete({
      where: { id: currentUser.id },
    });
    
    return NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다.',
    });
  } catch (error) {
    console.error('회원 탈퇴 오류:', error);
    return NextResponse.json(
      { message: '회원 탈퇴 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
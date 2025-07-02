import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

// 특정 사용자 정보 조회 API (관리자만 가능)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const userId = await params.id;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });
    
    if (!user) {
      return NextResponse.json(
        { message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { message: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 특정 사용자 정보 수정 API (관리자만 가능)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const userId = await params.id;
    
    // 요청 본문에서 데이터 가져오기
    const { nickname, email, role, newPassword } = await request.json();
    
    // 데이터 검증
    if (!nickname || nickname.trim() === '') {
      return NextResponse.json(
        { message: '닉네임은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 현재 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 업데이트할 데이터 준비
    const updateData: any = {
      nickname,
    };
    
    // 이메일 변경
    if (email && email !== user.email) {
      // 이메일 중복 확인
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return NextResponse.json(
          { message: '이미 사용 중인 이메일입니다.' },
          { status: 400 }
        );
      }
      
      updateData.email = email;
    }
    
    // 역할 변경
    if (role && (role === 'ADMIN' || role === 'USER')) {
      updateData.role = role;
    }
    
    // 비밀번호 변경 요청이 있는 경우
    if (newPassword) {
      // 새 비밀번호 유효성 검사 (최소 8자 이상)
      if (newPassword.length < 8) {
        return NextResponse.json(
          { message: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { status: 400 }
        );
      }
      
      // 새 비밀번호 해시
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }
    
    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    return NextResponse.json(
      { message: '사용자 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
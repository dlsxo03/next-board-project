import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcrypt';

// 내 프로필 조회 API
export async function GET() {
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
    
    // 사용자 정보 조회 (민감한 정보 제외)
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
    console.error('프로필 조회 오류:', error);
    return NextResponse.json(
      { message: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 내 프로필 수정 API
export async function PATCH(request: NextRequest) {
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
    
    // 요청 본문에서 데이터 가져오기
    const { nickname, currentPassword, newPassword } = await request.json();
    
    // 데이터 검증
    if (!nickname || nickname.trim() === '') {
      return NextResponse.json(
        { message: '닉네임은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 현재 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
    
    // 비밀번호 변경 요청이 있는 경우
    if (currentPassword && newPassword) {
      // 현재 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: '현재 비밀번호가 일치하지 않습니다.' },
          { status: 400 }
        );
      }
      
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
      where: { id: currentUser.id },
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
    console.error('프로필 수정 오류:', error);
    return NextResponse.json(
      { message: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
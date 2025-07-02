import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 공지사항 상세 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const noticeId = await params.id;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const noticeId = pathParts[pathParts.indexOf('notices') + 1];
    
    // 공지사항 상세 정보 조회
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
    
    if (!notice) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(notice);
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json(
      { message: '공지사항 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 공지사항 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 관리자 권한 확인
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '관리자만 공지사항을 수정할 수 있습니다.' },
        { status: 403 }
      );
    }
    
    const noticeId = await params.id;
    
    // 요청 본문에서 데이터 가져오기
    const { title, content, isPinned } = await request.json();
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { message: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 공지사항 존재 여부 확인
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });
    
    if (!existingNotice) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 공지사항 수정
    const updatedNotice = await prisma.notice.update({
      where: { id: noticeId },
      data: {
        title,
        content,
        isPinned: isPinned !== undefined ? isPinned : existingNotice.isPinned,
      },
    });
    
    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error('공지사항 수정 오류:', error);
    return NextResponse.json(
      { message: '공지사항 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 공지사항 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 관리자 권한 확인
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '관리자만 공지사항을 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }
    
    const noticeId = await params.id;
    
    // 공지사항 존재 여부 확인
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });
    
    if (!existingNotice) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 공지사항 삭제
    await prisma.notice.delete({
      where: { id: noticeId },
    });
    
    return NextResponse.json({ message: '공지사항이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('공지사항 삭제 오류:', error);
    return NextResponse.json(
      { message: '공지사항 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 댓글 상세 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 댓글 ID 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const commentId = pathParts[pathParts.indexOf('comments') + 1];
    
    console.log('GET 댓글 상세 요청 - commentId:', commentId);
    
    if (!commentId) {
      return NextResponse.json(
        { message: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    if (!comment) {
      return NextResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return NextResponse.json(
      { message: '댓글 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // URL에서 댓글 ID 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const commentId = pathParts[pathParts.indexOf('comments') + 1];
    
    console.log('PUT 댓글 수정 요청 - commentId:', commentId);
    
    if (!commentId) {
      return NextResponse.json(
        { message: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 요청 본문에서 데이터 가져오기
    const { content } = await request.json();
    
    // 필수 필드 검증
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: '댓글 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 댓글 존재 여부 및 작성자 확인
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
      },
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 작성자 본인 또는 관리자만 수정 가능
    if (existingComment.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '댓글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 댓글 수정
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    return NextResponse.json(
      { message: '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // URL에서 댓글 ID 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const commentId = pathParts[pathParts.indexOf('comments') + 1];
    
    console.log('DELETE 댓글 삭제 요청 - commentId:', commentId);
    
    if (!commentId) {
      return NextResponse.json(
        { message: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 댓글 존재 여부 및 작성자 확인
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
      },
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 작성자 본인 또는 관리자만 삭제 가능
    if (existingComment.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 댓글 삭제
    await prisma.comment.delete({
      where: { id: commentId },
    });
    
    return NextResponse.json(
      { message: '댓글이 성공적으로 삭제되었습니다.' }
    );
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json(
      { message: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 댓글 생성 API
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
    
    // 요청 본문에서 데이터 가져오기
    const { postId, content } = await request.json();
    
    // 필수 필드 검증
    if (!postId || !content) {
      return NextResponse.json(
        { message: '게시글 ID와 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return NextResponse.json(
        { message: '존재하지 않는 게시글입니다.' },
        { status: 404 }
      );
    }
    
    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: {
            nickname: true,
          },
        },
      },
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    return NextResponse.json(
      { message: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
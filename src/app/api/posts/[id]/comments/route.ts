import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 댓글 조회 함수
async function getComments(postId: string) {
  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { error: '게시글을 찾을 수 없습니다.', status: 404 };
    }

    // 댓글 조회
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: comments, status: 200 };
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return { error: '댓글을 불러오는데 실패했습니다.', status: 500 };
  }
}

// 댓글 생성 함수
async function createComment(postId: string, content: string, currentUser: any) {
  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { error: '게시글을 찾을 수 없습니다.', status: 404 };
    }

    // 내용 검증
    if (!content || content.trim() === '') {
      return { error: '댓글 내용을 입력해주세요.', status: 400 };
    }

    // 댓글 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        author: {
          connect: { id: currentUser.id },
        },
        post: {
          connect: { id: postId },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { data: comment, status: 201 };
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    return { error: '댓글 작성에 실패했습니다.', status: 500 };
  }
}

// 댓글 목록 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 postId 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const postId = pathParts[pathParts.indexOf('posts') + 1];
    
    console.log('GET 댓글 요청 - postId:', postId);
    
    // 게시글 ID 검증
    if (!postId) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 댓글 조회 함수 호출
    const result = await getComments(postId);
    
    if ('error' in result) {
      return NextResponse.json(
        { message: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('댓글 조회 처리 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 작성 API
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // URL에서 postId 추출
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const postId = pathParts[pathParts.indexOf('posts') + 1];
    
    console.log('POST 댓글 요청 - postId:', postId);
    
    // 게시글 ID 검증
    if (!postId) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 요청 본문 검증
    const body = await request.json().catch(() => ({}));
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { message: '댓글 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 댓글 생성 함수 호출
    const result = await createComment(postId, content, currentUser);
    
    if ('error' in result) {
      return NextResponse.json(
        { message: result.error },
        { status: result.status }
      );
    }
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('댓글 생성 처리 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
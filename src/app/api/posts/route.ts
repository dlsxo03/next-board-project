import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 게시글 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // 카테고리별 필터링 조건 설정
    const where = category ? { category } : {};
    
    // 전체 게시글 수 조회 (페이지네이션 정보용)
    const totalCount = await prisma.post.count({ where });
    
    // 게시글 목록 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc', // 최신순 정렬
      },
      include: {
        author: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true, // 댓글 수
          },
        },
      },
      skip,
      take: limit,
    });
    
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      posts,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    return NextResponse.json(
      { message: '게시글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 게시글 작성 API
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
    const { title, content, category, imageUrl } = await request.json();
    
    // 필수 필드 검증
    if (!title || !content || !category) {
      return NextResponse.json(
        { message: '제목, 내용, 카테고리는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 게시글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        imageUrl: imageUrl || null, // 이미지 URL (선택사항)
        authorId: currentUser.id,
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    return NextResponse.json(
      { message: '게시글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
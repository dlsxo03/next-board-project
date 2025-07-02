import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 검색 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all'; // 'title', 'content', 'author', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // 빈 검색어인 경우
    if (!query.trim()) {
      return NextResponse.json(
        { message: '검색어를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 검색 조건 설정
    let where = {};
    
    switch (type) {
      case 'title':
        where = {
          title: {
            contains: query,
          },
        };
        break;
      case 'content':
        where = {
          content: {
            contains: query,
          },
        };
        break;
      case 'author':
        where = {
          author: {
            nickname: {
              contains: query,
            },
          },
        };
        break;
      case 'all':
      default:
        where = {
          OR: [
            {
              title: {
                contains: query,
              },
            },
            {
              content: {
                contains: query,
              },
            },
            {
              author: {
                nickname: {
                  contains: query,
                },
              },
            },
          ],
        };
        break;
    }
    
    // 전체 검색 결과 수 조회
    const totalCount = await prisma.post.count({ where });
    
    // 검색 결과 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
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
    console.error('검색 오류:', error);
    return NextResponse.json(
      { message: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
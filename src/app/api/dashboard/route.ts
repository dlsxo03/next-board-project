import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// 대시보드 API 엔드포인트
export async function GET() {
  try {
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 로그인하지 않은 경우 로그인 필요 응답
    if (!currentUser) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }
    
    // 총 사용자 수 조회
    const totalUsers = await prisma.user.count();
    
    // 총 게시글 수 조회
    const totalPosts = await prisma.post.count();
    
    // 총 댓글 수 조회
    const totalComments = await prisma.comment.count();
    
    // 최근 게시글 5개 조회
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { nickname: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });
    
    // 최근 댓글 5개 조회
    const recentComments = await prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { nickname: true }
        },
        post: {
          select: { id: true, title: true }
        }
      }
    });
    
    // 현재 사용자의 게시글 및 댓글 수 조회
    const userStats = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });
    
    // 응답 데이터 구성
    const dashboardData = {
      totalUsers,
      totalPosts,
      totalComments,
      recentPosts,
      recentComments,
      userStats: userStats ? {
        postsCount: userStats._count.posts,
        commentsCount: userStats._count.comments
      } : null
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      { message: '대시보드 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 
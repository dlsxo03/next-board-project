import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/upload';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    
    // 요청 본문에서 이미지 URL 및 게시글 ID 가져오기
    const requestBody = await request.json();
    const { imageUrl, postId } = requestBody;
    
    if (!imageUrl) {
      return NextResponse.json(
        { message: '삭제할 이미지 URL이 필요합니다.' },
        { status: 400 }
      );
    }
    
    console.log('이미지 삭제 요청:', { imageUrl, postId });
    
    // 게시글 ID가 제공된 경우, 권한 검사
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, imageUrl: true },
      });
      
      if (!post) {
        return NextResponse.json(
          { message: '게시글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 게시글 작성자 또는 관리자만 삭제 가능
      if (post.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
        return NextResponse.json(
          { message: '이미지를 삭제할 권한이 없습니다.' },
          { status: 403 }
        );
      }
      
      // 이미지 URL이 게시글의 이미지와 일치하는지 확인
      if (post.imageUrl !== imageUrl) {
        return NextResponse.json(
          { message: '게시글의 이미지 URL과 일치하지 않습니다.' },
          { status: 400 }
        );
      }
    }
    
    console.log('삭제할 이미지 URL:', imageUrl);
    
    // 이미지 파일 삭제 (리사이즈된 이미지만 있으므로 바로 삭제)
    try {
      await deleteFile(imageUrl);
      console.log('이미지 파일 삭제 완료');
    } catch (error) {
      console.error('이미지 파일 삭제 중 오류:', error);
      // 삭제 실패해도 진행
    }
    
    // 게시글 ID가 제공된 경우, 게시글의 이미지 URL 제거
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { imageUrl: null },
      });
      console.log('게시글 이미지 URL 제거 완료');
    }
    
    return NextResponse.json({ 
      message: '이미지가 성공적으로 삭제되었습니다.',
      deletedPaths: [imageUrl]
    });
  } catch (error) {
    console.error('이미지 삭제 API 오류:', error);
    return NextResponse.json(
      { message: '이미지 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
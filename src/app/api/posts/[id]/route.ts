import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { deleteFile } from '@/lib/upload';

// 게시글 상세 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 ID 추출 (params 대신)
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.indexOf('posts') + 1];
    
    console.log('GET 게시글 요청 - postId:', id);
    
    if (!id) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // 게시글 상세 정보 조회
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return NextResponse.json(
      { message: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 게시글 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 ID 추출 (params 대신)
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.indexOf('posts') + 1];
    
    console.log('PUT 게시글 수정 요청 - postId:', id);
    
    if (!id) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
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
    const requestBody = await request.json();
    const { title, content, category, imageUrl } = requestBody;
    
    console.log('수정 요청 데이터:', { title, content, category, imageUrl });
    
    // 필수 필드 검증
    if (!title || !content || !category) {
      return NextResponse.json(
        { message: '제목, 내용, 카테고리는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 게시글 존재 여부 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        imageUrl: true,
      },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 작성자 본인 또는 관리자만 수정 가능
    if (existingPost.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '게시글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 요청 객체에서 기존 이미지 URL 사용
    const updateData = {
      title,
      content,
      category,
    };
    
    // 이미지 URL이 명시적으로 제공된 경우에만 업데이트
    if (imageUrl !== undefined) {
      // @ts-ignore
      updateData.imageUrl = imageUrl;
    }
    
    // 게시글 수정
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    return NextResponse.json(
      { message: '게시글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 게시글 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // URL에서 ID 추출 (params 대신)
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.indexOf('posts') + 1];
    
    console.log('DELETE 게시글 삭제 요청 - postId:', id);
    
    if (!id) {
      return NextResponse.json(
        { message: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 현재 로그인한 사용자 확인
    const currentUser = await getCurrentUser();
    
    // 로그인하지 않은 경우
    if (!currentUser) {
      return NextResponse.json(
        { message: '로그인이 필요한 기능입니다.' },
        { status: 401 }
      );
    }
    
    // 게시글 존재 여부 및 작성자 확인
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: {
        authorId: true,
        imageUrl: true, // 이미지 URL 정보 가져오기
      },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 작성자 본인 또는 관리자만 삭제 가능
    if (existingPost.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 이미지 파일이 있는 경우 삭제
    if (existingPost.imageUrl) {
      try {
        const imageUrl = existingPost.imageUrl;
        console.log('삭제할 이미지 URL:', imageUrl);
        
        // 이미지 URL이 문자열인지 확인
        if (typeof imageUrl !== 'string') {
          throw new Error('이미지 URL이 유효하지 않습니다.');
        }
        
        // 이미지 파일 삭제 (리사이즈된 이미지만 있으므로 바로 삭제)
        await deleteFile(imageUrl);
        console.log('이미지 파일 삭제 완료');
      } catch (error) {
        console.error('이미지 파일 삭제 오류:', error);
        // 이미지 삭제 실패해도 게시글은 삭제 진행
      }
    }
    
    // 게시글 삭제
    await prisma.post.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: '게시글이 성공적으로 삭제되었습니다.' }
    );
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    return NextResponse.json(
      { message: '게시글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
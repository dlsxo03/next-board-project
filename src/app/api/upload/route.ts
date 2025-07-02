import { NextRequest, NextResponse } from 'next/server';
import { resizeImage } from '@/lib/upload';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// NextJS에서는 기본적으로 API 라우트의 Body Parser를 사용하지만, 
// 파일 업로드를 위해 formidable을 사용해 직접 처리
export const config = {
  api: {
    bodyParser: false,
  },
};

// 파일 업로드 처리 함수
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
    
    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: '업로드할 파일이 없습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 타입 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: '지원되지 않는 파일 형식입니다. 이미지 파일만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 크기 검사 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: '파일 크기가 너무 큽니다. 5MB 이하의 이미지만 업로드할 수 있습니다.' },
        { status: 400 }
      );
    }
    
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop() || '';
    // 고유 파일명 생성
    const fileName = `${uuidv4()}.${fileExt}`;
    // 파일 저장 경로
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, fileName);
    
    // 디렉토리 확인 및 생성
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    // 파일 버퍼로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 파일 저장
    await fs.writeFile(filePath, buffer);
    
    // 파일 URL 생성
    const fileUrl = `/uploads/${fileName}`;
    
    // 이미지 리사이징 및 원본 삭제
    let resizedUrl = fileUrl;
    
    try {
      // 이미지 리사이징 (항상 리사이징)
      resizedUrl = await resizeImage(filePath, 800);
      
      // 원본 이미지 파일 삭제 (리사이징 성공 후)
      await fs.unlink(filePath);
      console.log('원본 이미지 삭제 완료:', filePath);
      
      // 클라이언트에게는 리사이즈된 이미지 URL만 반환
      return NextResponse.json({ 
        url: resizedUrl,
        resizedUrl,
        message: '파일 업로드가 완료되었습니다.' 
      });
    } catch (error) {
      console.error('이미지 처리 오류:', error);
      // 리사이징 실패 시 원본 이미지 URL 반환
      return NextResponse.json({ 
        url: fileUrl,
        resizedUrl: fileUrl,
        message: '이미지 리사이징 중 오류가 발생했습니다. 원본 이미지를 사용합니다.' 
      });
    }
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { message: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
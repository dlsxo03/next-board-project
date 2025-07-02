import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request } from 'express';

// 업로드 디렉토리 설정
const uploadDir = path.join(process.cwd(), 'public/uploads');

// 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 스토리지 설정
const storage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // uuid를 사용하여 고유한 파일 이름 생성
    const uniqueId = uuidv4();
    // 원본 파일 확장자 유지
    const ext = path.extname(file.originalname);
    // 파일명 생성 (UUID + 원본 확장자)
    cb(null, `${uniqueId}${ext}`);
  },
});

// 파일 필터 - 이미지 파일만 허용
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 허용되는 이미지 타입
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원되지 않는 파일 형식입니다. 이미지 파일만 업로드할 수 있습니다.'));
  }
};

// Multer 설정
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

// 이미지 리사이징 함수
export async function resizeImage(
  filePath: string,
  width: number = 800,
  quality: number = 85
): Promise<string> {
  try {
    const ext = path.extname(filePath);
    const filename = path.basename(filePath, ext);
    const outputPath = path.join(uploadDir, `${filename}_resized${ext}`);
    
    await sharp(filePath)
      .resize(width)
      .jpeg({ quality })
      .toFile(outputPath);
    
    return `/uploads/${filename}_resized${ext}`;
  } catch (error) {
    console.error('이미지 리사이징 오류:', error);
    throw error;
  }
}

// 파일 삭제 함수
export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 상대 경로를 절대 경로로 변환
    const fullPath = path.join(process.cwd(), 'public', filePath.replace(/^\//, ''));
    
    fs.unlink(fullPath, (err) => {
      if (err) {
        // 파일이 존재하지 않는 경우는 성공으로 처리
        if (err.code === 'ENOENT') {
          console.log(`파일이 존재하지 않음: ${fullPath}`);
          resolve();
        } else {
          console.error(`파일 삭제 오류: ${fullPath}`, err);
          reject(err);
        }
      } else {
        console.log(`파일 삭제 성공: ${fullPath}`);
        resolve();
      }
    });
  });
} 
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 카테고리 목록
const CATEGORIES = ['일반', '질문', '정보', '자유'];

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    imageUrl: '',
  });

  // 게시글 데이터 불러오기
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/posts/${routeParams.id}`);
        
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setPost(data);
        setFormData({
          title: data.title,
          content: data.content,
          category: data.category,
          imageUrl: data.imageUrl || '',
        });
        
        // 기존 이미지가 있다면 미리보기 설정
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [routeParams.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 이미지 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 파일 유형 검사
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 이미지만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 검사 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기가 너무 큽니다. 5MB 이하의 이미지만 업로드할 수 있습니다.');
      return;
    }
    
    try {
      setUploadingImage(true);
      setError('');
      
      // FormData 준비
      const formData = new FormData();
      formData.append('file', file);
      
      // 파일 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '이미지 업로드에 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 업로드된 이미지 URL 저장
      setFormData((prev) => ({
        ...prev,
        imageUrl: data.resizedUrl || data.url,
      }));
      
      // 이미지 미리보기 표시
      setImagePreview(data.url);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploadingImage(false);
    }
  };
  
  // 이미지 제거
  const handleRemoveImage = async () => {
    // 이미 업로드된 이미지가 있고 아직 제거되지 않았다면
    if (post?.imageUrl && formData.imageUrl) {
      try {
        setError('');
        const originalUrl = post.imageUrl;
        
        // 파일명 추출
        const fileName = originalUrl.split('/').pop(); // 전체 파일명 (확장자 포함)
        if (!fileName) {
          throw new Error('파일명을 추출할 수 없습니다.');
        }
        
        const fileNameParts = fileName.split('.');
        const ext = fileNameParts.pop() || ''; // 확장자
        const baseName = fileNameParts.join('.'); // 확장자를 제외한 파일명
        
        console.log('이미지 제거 요청:', { originalUrl, fileName, baseName, ext });
        
        // API 요청으로 이미지 삭제
        const response = await fetch('/api/upload/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: originalUrl,
            postId: routeParams.id
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('이미지 삭제 오류:', errorData);
          // 이미지 삭제 실패해도 로컬 상태는 업데이트
        }
      } catch (error: any) {
        console.error('이미지 삭제 중 오류:', error);
        // 이미지 삭제 실패해도 로컬 상태는 업데이트
      }
    }
    
    // 로컬 상태 업데이트
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      setError('제목, 내용, 카테고리는 필수 입력 항목입니다.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('게시글 수정 요청 데이터:', { ...formData });
      
      const response = await fetch(`/api/posts/${routeParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 수정에 실패했습니다.');
      }
      
      router.push(`/posts/${routeParams.id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
        게시글을 불러오는 중...
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/posts"
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">게시글 수정</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="category" className="block mb-1 font-medium dark:text-gray-300">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-medium dark:text-gray-300">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block mb-1 font-medium dark:text-gray-300">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          {/* 이미지 업로드 섹션 */}
          <div className="mb-6">
            <label className="block mb-1 font-medium dark:text-gray-300">
              이미지 첨부 (선택사항)
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage || isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || isSubmitting || !!imagePreview}
                className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (uploadingImage || isSubmitting || !!imagePreview) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImage ? '업로드 중...' : '이미지 선택'}
              </button>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="ml-3 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-800/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  이미지 제거
                </button>
              )}
            </div>
            
            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">이미지 미리보기:</p>
                <div className="relative w-full max-w-md h-64 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md">
                  <Image
                    src={imagePreview}
                    alt="업로드된 이미지"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Link
              href={`/posts/${routeParams.id}`}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className={`px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition ${
                (isSubmitting || uploadingImage) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
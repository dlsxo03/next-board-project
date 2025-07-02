'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface DeletePostButtonProps {
  postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  
  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '게시글 삭제에 실패했습니다.');
        }
        
        // 삭제 성공 시 목록 페이지로 이동
        router.push('/posts');
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
    >
      삭제
    </button>
  );
} 
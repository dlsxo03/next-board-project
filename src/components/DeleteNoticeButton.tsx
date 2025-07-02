'use client';

import React from 'react';

interface DeleteNoticeButtonProps {
  noticeId: string;
}

export default function DeleteNoticeButton({ noticeId }: DeleteNoticeButtonProps) {
  const handleDelete = async () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/notices/${noticeId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          window.location.href = '/notices';
        } else {
          alert('삭제 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
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
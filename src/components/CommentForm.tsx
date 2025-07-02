'use client';

import React, { useState } from 'react';

interface CommentFormProps {
  postId: string;
  onCommentAdded: (newComment: any) => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('댓글 작성 시도:', postId);
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '댓글 작성에 실패했습니다.');
      }
      
      const newComment = await response.json();
      console.log('댓글 작성 성공:', newComment);
      
      // 부모 컴포넌트에 새 댓글 전달
      onCommentAdded(newComment);
      
      // 입력 필드 초기화
      setContent('');
    } catch (error: any) {
      console.error('댓글 작성 오류:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium mb-2">댓글 작성</h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="댓글을 작성해주세요."
          rows={3}
          disabled={isSubmitting}
        />
        
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </form>
    </div>
  );
} 
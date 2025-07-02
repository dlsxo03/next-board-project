'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      nickname: string;
    };
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onCommentUpdated: (commentId: string, newContent: string) => void;
  onCommentDeleted: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onCommentUpdated,
  onCommentDeleted,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 현재 사용자가 댓글 작성자인지 또는 관리자인지 확인
  const canModify = currentUserId === comment.author.id || isAdmin;
  
  const handleUpdate = async () => {
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log('댓글 수정 시도:', comment.id);
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      console.log('댓글 수정 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('댓글 수정 오류 응답:', errorData);
        throw new Error(errorData.message || '댓글 수정에 실패했습니다.');
      }
      
      const updatedComment = await response.json();
      console.log('댓글 수정 성공:', updatedComment);
      
      // 부모 컴포넌트에 수정된 댓글 내용 전달
      onCommentUpdated(comment.id, content);
      
      // 수정 모드 종료
      setIsEditing(false);
    } catch (error: any) {
      console.error('댓글 수정 오류:', error);
      setError(error.message || '댓글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      console.log('댓글 삭제 시도:', comment.id);
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });
      
      console.log('댓글 삭제 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('댓글 삭제 오류 응답:', errorData);
        throw new Error(errorData.message || '댓글 삭제에 실패했습니다.');
      }
      
      console.log('댓글 삭제 성공');
      
      // 부모 컴포넌트에 삭제된 댓글 ID 전달
      onCommentDeleted(comment.id);
    } catch (error: any) {
      console.error('댓글 삭제 오류:', error);
      alert(error.message || '댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{comment.author.nickname}</span>
        <span className="text-sm text-gray-500">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      
      {isEditing ? (
        <div>
          {error && (
            <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            disabled={isSubmitting}
          />
          
          <div className="flex justify-end mt-2 space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
            >
              취소
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className={`px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2">{comment.content}</p>
          
          {canModify && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
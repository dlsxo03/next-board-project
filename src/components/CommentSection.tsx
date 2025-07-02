'use client';

import React, { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { formatDate } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
  initialComments?: any[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export default function CommentSection({
  postId,
  initialComments = [],
  currentUserId,
  isAdmin,
}: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>(initialComments);
  const [loading, setLoading] = useState(!initialComments.length);
  const [error, setError] = useState('');
  const [currentUserState, setCurrentUserState] = useState(currentUserId);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // 댓글 데이터 불러오기
  useEffect(() => {
    // 초기 댓글이 있거나 이미 요청을 시도했으면 중복 요청하지 않음
    if (initialComments.length > 0 || hasAttemptedFetch) {
      return;
    }
    
    async function fetchComments() {
      try {
        setLoading(true);
        setError('');
        setHasAttemptedFetch(true);
        
        console.log('댓글 불러오기 시작:', postId);
        const response = await fetch(`/api/posts/${postId}/comments`);
        console.log('댓글 응답 상태:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('댓글 조회 오류:', errorData);
          throw new Error(errorData.message || '댓글을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        console.log('받은 댓글 수:', data.length);
        setComments(data);
        
        // 사용자 정보가 없는 경우 현재 사용자 정보 조회 (한 번만 수행)
        if (!currentUserId && !currentUserState) {
          try {
            const userResponse = await fetch('/api/users/me');
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentUserState(userData.id);
            }
          } catch (error) {
            console.error('사용자 정보 조회 오류:', error);
          }
        }
      } catch (error: any) {
        console.error('댓글 불러오기 오류:', error);
        setError(error.message || '댓글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchComments();
  }, [postId, hasAttemptedFetch]);

  // 새 댓글 추가 핸들러
  const handleCommentAdded = (newComment: any) => {
    setComments([...comments, newComment]);
  };

  // 댓글 수정 핸들러
  const handleCommentUpdated = (commentId: string, newContent: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, content: newContent }
          : comment
      )
    );
  };

  // 댓글 삭제 핸들러
  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold">댓글 로딩 중...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 text-red-500">
          <p className="font-bold">댓글 불러오기 오류</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">댓글 ({comments.length})</h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex justify-between">
                <div className="font-medium dark:text-white">{comment.author.nickname}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</div>
              </div>
              <div className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</div>
              
              {/* 댓글 작성자 또는 관리자만 볼 수 있는 삭제 버튼 */}
              {currentUserState && (currentUserState === comment.authorId || isAdmin) && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleCommentDeleted(comment.id)}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
          </div>
        )}
      </div>
      
      {/* 댓글 작성 폼 */}
      {currentUserState && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700">
          <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
      )}
    </div>
  );
} 
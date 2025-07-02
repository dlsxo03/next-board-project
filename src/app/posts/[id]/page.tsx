'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CommentSection from '@/components/CommentSection';
import { formatDate } from '@/lib/utils';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const routeParams = useParams();
  
  // 게시글 데이터 불러오기
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError('');
        
        // 게시글 상세 정보 조회
        const response = await fetch(`/api/posts/${routeParams.id}`);
        
        if (!response.ok) {
          throw new Error('게시글을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setPost(data);
        
        // 현재 사용자 정보 조회
        const userResponse = await fetch('/api/users/me');
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [routeParams.id]);
  
  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!post) return;

    const confirmDelete = window.confirm('정말로 이 게시글을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/posts/${routeParams.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('게시글 삭제에 실패했습니다.');
      }

      alert('게시글이 삭제되었습니다.');
      router.push('/posts');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // 삭제 확인 취소
  const cancelDelete = () => {
    setDeleteConfirm(false);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
        게시글을 불러오는 중...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
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
  
  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900 dark:text-white">
        존재하지 않는 게시글입니다.
      </div>
    );
  }
  
  const isAuthor = currentUser && post.author.id === currentUser.id;
  const isAdmin = currentUser?.role === 'ADMIN';
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                {post.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                조회 {post.viewCount}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 dark:text-white">{post.title}</h1>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center">
                <div className="font-medium dark:text-white">{post.author.nickname}</div>
                <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</div>
              </div>
              
              {canEdit && (
                <div className="flex space-x-2">
                  <Link
                    href={`/posts/edit/${post.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    {isDeleting
                      ? '삭제 중...'
                      : deleteConfirm
                      ? '정말 삭제하시겠습니까?'
                      : '삭제'}
                  </button>
                  {deleteConfirm && (
                    <button
                      onClick={cancelDelete}
                      className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      취소
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* 본문 내용 */}
            <div className="prose max-w-none mb-6 dark:prose-invert">
              <div className="whitespace-pre-wrap dark:text-gray-300">{post.content}</div>
            </div>
            
            {/* 이미지 표시 */}
            {post.imageUrl && (
              <div className="mt-4 mb-6">
                <div className="relative w-full max-w-2xl h-96 mx-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt="게시글 이미지"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-8">
              <Link
                href="/posts"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                목록으로
              </Link>
            </div>
          </div>
        </div>
        
        {/* 댓글 섹션 */}
        <CommentSection postId={post.id} isAdmin={isAdmin} />
      </div>
    </div>
  );
} 
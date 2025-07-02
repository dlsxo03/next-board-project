'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';

// 대시보드 통계 타입
interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  recentPosts: PostSummary[];
  recentComments: CommentSummary[];
  userStats: {
    postsCount: number;
    commentsCount: number;
  } | null;
}

// 게시글 요약 타입
interface PostSummary {
  id: string;
  title: string;
  createdAt: string;
  author: {
    nickname: string;
  };
  _count: {
    comments: number;
  };
  viewCount: number;
}

// 댓글 요약 타입
interface CommentSummary {
  id: string;
  content: string;
  createdAt: string;
  author: {
    nickname: string;
  };
  post: {
    id: string;
    title: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // 클라이언트 측에서 인증 체크 수행
  useEffect(() => {
    // 세션이 없고 로딩이 완료된 경우
    if (!session && status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router]);
  
  // 대시보드 데이터 가져오기
  useEffect(() => {
    async function fetchDashboardData() {
      if (status !== 'authenticated') return;
      
      try {
        setIsDataLoading(true);
        setError('');
        
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsDataLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [status]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">사용자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 세션이 없는 경우 (미들웨어에 의해 리디렉션 될 것이므로 여기서는 로딩 표시)
  if (!session) {
    return (
      <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">로그인 페이지로 이동 중...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-200">
          {error}
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  // 데이터 로딩 중
  if (isDataLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">대시보드 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">대시보드</h1>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border-t-4 border-blue-500">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-1">게시글</h2>
            <p className="text-3xl font-bold dark:text-white">{stats?.totalPosts || 0}</p>
            {stats?.userStats && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">내가 작성한 게시글: {stats.userStats.postsCount}개</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border-t-4 border-green-500">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-1">댓글</h2>
            <p className="text-3xl font-bold dark:text-white">{stats?.totalComments || 0}</p>
            {stats?.userStats && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">내가 작성한 댓글: {stats.userStats.commentsCount}개</p>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border-t-4 border-purple-500">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide mb-1">사용자</h2>
            <p className="text-3xl font-bold dark:text-white">{stats?.totalUsers || 0}</p>
            <Link href="/profile" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mt-2 inline-block">
              내 프로필 관리
            </Link>
          </div>
        </div>
        
        {/* 최근 게시글 */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold dark:text-white">최근 게시글</h2>
            <Link href="/posts" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
              모든 게시글 보기
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제목
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성자
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성일
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    조회/댓글
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.recentPosts && stats.recentPosts.length > 0 ? (
                  stats.recentPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/posts/${post.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.author.nickname}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.viewCount} / {post._count.comments}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      게시글이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 최근 댓글 */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">최근 댓글</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats?.recentComments && stats.recentComments.length > 0 ? (
              stats.recentComments.map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium dark:text-white">{comment.author.nickname}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm mt-1 mb-2 text-gray-600 dark:text-gray-300 line-clamp-2">{comment.content}</p>
                  <Link href={`/posts/${comment.post.id}`} className="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    게시글: {comment.post.title}
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                댓글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
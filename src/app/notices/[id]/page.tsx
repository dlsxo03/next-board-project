'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import DeleteNoticeButton from '@/components/DeleteNoticeButton';

export default function NoticePage() {
  const routeParams = useParams();
  const [notice, setNotice] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // API를 통해 데이터 가져오기
        const noticeResponse = await fetch(`/api/notices/${routeParams.id}`);
        
        if (!noticeResponse.ok) {
          if (noticeResponse.status === 404) {
            notFound();
          }
          throw new Error('공지사항을 불러오는데 실패했습니다');
        }
        
        const fetchedNotice = await noticeResponse.json();
        setNotice(fetchedNotice);
        
        // 현재 사용자 정보 가져오기
        const userResponse = await fetch('/api/users/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
          setIsAdmin(userData?.role === 'ADMIN');
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [routeParams.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900 dark:text-gray-300">
        공지사항을 불러오는 중...
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
            href="/notices"
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900 dark:text-white">
        존재하지 않는 공지사항입니다.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold dark:text-white">
              {notice.isPinned && (
                <span className="mr-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                  중요
                </span>
              )}
              {notice.title}
            </h1>
            {isAdmin && (
              <div className="flex space-x-2">
                <Link
                  href={`/notices/edit/${notice.id}`}
                  className="px-3 py-1 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition text-sm"
                >
                  수정
                </Link>
                <DeleteNoticeButton noticeId={routeParams.id as string} />
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6 pb-3 border-b dark:border-gray-700">
            <div>작성자: {notice.author?.nickname}</div>
            <div>작성일: {formatDate(notice.createdAt)}</div>
          </div>
          
          <div className="prose max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap dark:text-gray-300">{notice.content}</div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <Link
            href="/notices"
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 
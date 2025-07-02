import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/auth';

async function getNotices() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: {
          select: {
            nickname: true
          }
        }
      }
    });
    return notices;
  } catch (error) {
    console.error('공지사항 조회 에러:', error);
    return [];
  }
}

export default async function NoticesPage() {
  const notices = await getNotices();
  const currentUser = await getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">공지사항</h1>
          {isAdmin && (
            <Link
              href="/notices/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition"
            >
              공지사항 작성
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {notices.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">등록된 공지사항이 없습니다.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">등록일</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {notices.map((notice) => (
                  <tr key={notice.id} className={notice.isPinned ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notice.isPinned && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          중요
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/notices/${notice.id}`} className="text-indigo-600 hover:text-indigo-900">
                        {notice.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{notice.author.nickname}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(notice.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // 대시보드 페이지로 리디렉션
    router.push('/dashboard');
  }, [router]);
  
  return (
    <main className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 dark:text-white">게시판</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">게시글</h2>
          <p className="text-gray-600 dark:text-gray-300">최신 게시글을 확인하세요.</p>
        </div>
        {/* 다른 카드들... */}
      </div>
    </main>
  );
}

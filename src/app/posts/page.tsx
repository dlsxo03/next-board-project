'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';

// 카테고리 목록
const CATEGORIES = ['일반', '질문', '정보', '자유'];

// 검색 타입 옵션
const SEARCH_TYPES = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'author', label: '작성자' },
];

// 카테고리 한글 라벨 컴포넌트
function CategoryLabel({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    일반: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    질문: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    정보: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    자유: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  
  const bgColor = colorMap[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>
      {category}
    </span>
  );
}

// 페이지네이션 컴포넌트
function Pagination({ 
  currentPage, 
  totalPages,
  searchParams
}: { 
  currentPage: number; 
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;
  
  // 현재 검색 파라미터를 유지하면서 페이지만 변경
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/posts?${params.toString()}`;
  };
  
  return (
    <div className="flex justify-center mt-8">
      <nav className="flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-indigo-600 text-white dark:bg-indigo-700'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// async 키워드 제거 - 클라이언트 컴포넌트는 async일 수 없음
export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  
  // URL 파라미터에서 값 가져오기
  useEffect(() => {
    const category = searchParams?.get('category') || '';
    const page = parseInt(searchParams?.get('page') || '1');
    const query = searchParams?.get('query') || '';
    const type = searchParams?.get('type') || 'all';
    
    setSearchQuery(query);
    setSearchType(type);
    
    fetchPosts(page, category, query, type);
    fetchCurrentUser();
  }, [searchParams]);
  
  // 로그인한 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user || null);
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
    }
  };
  
  // 게시글 목록 가져오기
  const fetchPosts = async (page: number, category: string, query: string, type: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = `/api/posts?page=${page}`;
      
      // 카테고리 추가
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      // 검색어가 있으면 검색 API 사용
      if (query) {
        url = `/api/search?query=${encodeURIComponent(query)}&type=${type}&page=${page}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 검색 폼 제출 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // 검색어가 없으면 검색 파라미터 제거
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('query');
      params.delete('type');
      params.set('page', '1');
      router.push(`/posts?${params.toString()}`);
      return;
    }
    
    // 현재 카테고리를 유지하면서 검색 파라미터 추가
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('query', searchQuery);
    params.set('type', searchType);
    params.set('page', '1'); // 검색 시 첫 페이지로 이동
    router.push(`/posts?${params.toString()}`);
  };
  
  // 카테고리 링크 생성 함수
  const createCategoryUrl = (category: string = '') => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    params.set('page', '1'); // 카테고리 변경 시 첫 페이지로 이동
    
    // 검색어가 있으면 유지
    if (searchQuery) {
      params.set('query', searchQuery);
      params.set('type', searchType);
    }
    
    return `/posts?${params.toString()}`;
  };
  
  // 검색 초기화 핸들러
  const handleResetSearch = () => {
    setSearchQuery('');
    setSearchType('all');
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('query');
    params.delete('type');
    params.set('page', '1');
    router.push(`/posts?${params.toString()}`);
  };
  
  const isSearchActive = searchParams?.has('query');
  const currentCategory = searchParams?.get('category') || '';
  const currentPage = parseInt(searchParams?.get('page') || '1');
  
  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white mb-4 sm:mb-0">게시판</h1>
          {currentUser && (
            <Link
              href="/posts/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition"
            >
              글쓰기
            </Link>
          )}
        </div>
        
        {/* 검색 폼 */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-24 dark:bg-gray-700 dark:text-white"
            >
              {SEARCH_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                검색
              </button>
              
              {isSearchActive && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* 검색 정보 표시 */}
        {isSearchActive && (
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              '{searchParams?.get('query')}' 검색 결과: 총 {pagination.totalCount}개의 게시글을 찾았습니다.
            </p>
          </div>
        )}
        
        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={createCategoryUrl()}
            className={`px-3 py-1 rounded ${
              !currentCategory ? 'bg-indigo-600 text-white dark:bg-indigo-700' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            전체
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={createCategoryUrl(cat)}
              className={`px-3 py-1 rounded ${
                currentCategory === cat
                  ? 'bg-indigo-600 text-white dark:bg-indigo-700'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">게시글을 불러오는 중...</p>
          </div>
        )}
        
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded mb-6 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        
        {/* 게시글 목록 */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    조회
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryLabel category={post.category} />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/posts/${post.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                          <span className="font-medium">{post.title}</span>
                          {post._count?.comments > 0 && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              [{post._count.comments}]
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.author.nickname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.viewCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {isSearchActive ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 페이지네이션 */}
        {!isLoading && pagination.totalPages > 1 && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={pagination.totalPages} 
            searchParams={searchParams || new URLSearchParams()} 
          />
        )}
      </div>
    </div>
  );
} 
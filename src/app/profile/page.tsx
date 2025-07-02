'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import ProfileForm from './ProfileForm';
import DeleteAccount from './DeleteAccount';

// 사용자 프로필 타입
interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' 또는 'delete'
  
  // 프로필 정보 가져오기
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('/api/users/me');
        
        if (response.status === 401) {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push('/auth/signin');
          return;
        }
        
        if (!response.ok) {
          throw new Error('프로필 정보를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [router]);
  
  // 프로필 업데이트 핸들러
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">프로필 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/"
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">프로필 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">내 프로필</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
          <div className="border-b dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 font-medium ${
                  activeTab === 'profile'
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                프로필 정보
              </button>
              <button
                onClick={() => setActiveTab('delete')}
                className={`px-4 py-3 font-medium ${
                  activeTab === 'delete'
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                회원 탈퇴
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' ? (
              <>
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">이메일</p>
                      <p className="font-medium dark:text-white">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">닉네임</p>
                      <p className="font-medium dark:text-white">{profile.nickname}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">가입일</p>
                      <p className="font-medium dark:text-white">{formatDate(profile.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">역할</p>
                      <p className="font-medium dark:text-white">
                        {profile.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 border-t dark:border-gray-700 pt-4">
                  <h2 className="text-lg font-semibold mb-2 dark:text-white">활동 통계</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">작성한 게시글</p>
                      <p className="text-xl font-semibold dark:text-white">{profile._count?.posts || 0}개</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-500 dark:text-gray-400">작성한 댓글</p>
                      <p className="text-xl font-semibold dark:text-white">{profile._count?.comments || 0}개</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">프로필 수정</h2>
                  <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />
                </div>
              </>
            ) : (
              <DeleteAccount />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
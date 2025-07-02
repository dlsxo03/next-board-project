'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

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

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 폼 상태
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [newPassword, setNewPassword] = useState('');
  
  // 사용자 정보 가져오기
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/users/${userId}`);
        
        if (response.status === 403) {
          // 권한이 없는 경우 메인 페이지로 리다이렉트
          router.push('/');
          return;
        }
        
        if (!response.ok) {
          throw new Error('사용자 정보를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setProfile(data);
        
        // 폼 초기값 설정
        setNickname(data.nickname);
        setEmail(data.email);
        setRole(data.role);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // 변경된 사항이 있는지 확인
      if (
        profile &&
        nickname === profile.nickname &&
        email === profile.email &&
        role === profile.role &&
        !newPassword
      ) {
        setError('변경된 내용이 없습니다.');
        return;
      }
      
      const updateData: any = {
        nickname,
        email,
        role,
      };
      
      // 비밀번호 변경을 요청한 경우
      if (newPassword) {
        updateData.newPassword = newPassword;
      }
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '사용자 정보 업데이트에 실패했습니다.');
      }
      
      // 상태 업데이트
      setProfile(data);
      setSuccessMessage('사용자 정보가 성공적으로 업데이트되었습니다.');
      
      // 비밀번호 필드 초기화
      setNewPassword('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">사용자 정보를 불러오는 중...</p>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
        <div className="flex justify-center mt-4">
          <Link
            href="/admin"
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
          >
            관리자 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4 text-center dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">사용자 정보를 찾을 수 없습니다.</p>
        <div className="flex justify-center mt-4">
          <Link
            href="/admin"
            className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
          >
            관리자 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold dark:text-white">사용자 정보 수정</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            목록으로
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded text-red-700 dark:text-red-300 text-sm mb-4">
                {error}
              </div>
            )}
            
            {/* 성공 메시지 */}
            {successMessage && (
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded text-green-700 dark:text-green-300 text-sm mb-4">
                {successMessage}
              </div>
            )}
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">사용자 ID</p>
                <p className="font-medium dark:text-white">{profile.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">가입일</p>
                <p className="font-medium dark:text-white">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">게시글 수</p>
                <p className="font-medium dark:text-white">{profile._count?.posts || 0}개</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">댓글 수</p>
                <p className="font-medium dark:text-white">{profile._count?.comments || 0}개</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 닉네임 필드 */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                  minLength={2}
                  maxLength={20}
                />
              </div>
              
              {/* 이메일 필드 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              {/* 역할 선택 */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  역할
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="USER">일반 사용자</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
              
              {/* 새 비밀번호 */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  새 비밀번호 (변경하려면 입력)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  minLength={8}
                  placeholder="비밀번호를 변경하려면 입력하세요"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  최소 8자 이상 입력하세요. 입력하지 않으면 변경되지 않습니다.
                </p>
              </div>
              
              {/* 저장 버튼 */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
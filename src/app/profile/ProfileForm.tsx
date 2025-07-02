'use client';

import React, { useState } from 'react';

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

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      // 비밀번호 확인 체크
      if (newPassword && newPassword !== confirmPassword) {
        setError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      
      // 최소 비밀번호 길이 체크
      if (newPassword && newPassword.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      
      // 변경된 사항이 있는지 확인
      if (nickname === profile.nickname && !currentPassword && !newPassword) {
        setError('변경된 내용이 없습니다.');
        return;
      }
      
      const updateData: any = {
        nickname,
      };
      
      // 비밀번호 변경을 요청한 경우
      if (newPassword) {
        if (!currentPassword) {
          setError('현재 비밀번호를 입력해주세요.');
          return;
        }
        
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '프로필 업데이트에 실패했습니다.');
      }
      
      // 만약 서버 응답에 _count가 없다면 현재 프로필의 _count 값을 사용
      if (!data._count && profile._count) {
        data._count = profile._count;
      }
      
      // 폼 초기화
      resetForm();
      
      // 성공 메시지 표시
      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
      
      // 부모 컴포넌트 업데이트
      onUpdate(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {successMessage && (
        <div className="bg-green-100 p-3 rounded text-green-700 text-sm">
          {successMessage}
        </div>
      )}
      
      {/* 닉네임 필드 */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
          닉네임
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
          minLength={2}
          maxLength={20}
        />
      </div>
      
      {/* 비밀번호 변경 섹션 */}
      <div className="pt-4 border-t">
        <h3 className="text-md font-medium mb-3">비밀번호 변경</h3>
        
        {/* 현재 비밀번호 */}
        <div className="mb-3">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            현재 비밀번호
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* 새 비밀번호 */}
        <div className="mb-3">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            새 비밀번호
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            minLength={6}
          />
        </div>
        
        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            minLength={6}
          />
        </div>
      </div>
      
      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? '저장 중...' : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
} 
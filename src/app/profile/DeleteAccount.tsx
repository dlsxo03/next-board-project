'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccount() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 확인 텍스트 체크
      if (confirmText !== '계정 삭제 확인') {
        setError('확인 문구가 올바르지 않습니다.');
        return;
      }
      
      if (!password) {
        setError('비밀번호를 입력해주세요.');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // 계정 삭제 API 호출
      const response = await fetch('/api/users/me/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '계정 삭제에 실패했습니다.');
      }
      
      // 삭제 성공 시 로그인 페이지로 리다이렉트
      alert('계정이 성공적으로 삭제되었습니다.');
      router.push('/auth/signin');
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">주의: 계정 삭제</h3>
        <p className="text-yellow-700 text-sm mb-2">
          계정을 삭제하면 다음과 같은 결과가 발생합니다:
        </p>
        <ul className="list-disc pl-5 text-yellow-700 text-sm">
          <li>모든 개인 정보가 데이터베이스에서 영구적으로 삭제됩니다.</li>
          <li>작성한 게시글과 댓글은 삭제되지 않고 유지됩니다.</li>
          <li>삭제된 계정은 복구할 수 없습니다.</li>
        </ul>
      </div>
      
      {error && (
        <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-1">
            계정을 삭제하려면 <span className="font-semibold">'계정 삭제 확인'</span>을 입력하세요
          </label>
          <input
            type="text"
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            현재 비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            required
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? '처리 중...' : '계정 삭제'}
          </button>
        </div>
      </form>
    </div>
  );
} 
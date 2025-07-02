'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NoticeFormProps {
  params: {
    id: string;
  };
}

export default function EditNoticePage({ params }: NoticeFormProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
  });

  useEffect(() => {
    async function fetchNotice() {
      try {
        setLoading(true);
        const response = await fetch(`/api/notices/${params.id}`);
        
        if (!response.ok) {
          throw new Error('공지사항을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setNotice(data);
        setFormData({
          title: data.title,
          content: data.content,
          isPinned: data.isPinned,
        });
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNotice();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/notices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '공지사항 수정에 실패했습니다.');
      }
      
      router.push(`/notices/${params.id}`);
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 dark:bg-gray-900 dark:text-gray-300">로딩 중...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 dark:bg-gray-900 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">공지사항 수정</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleCheckboxChange}
                className="mr-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span>상단에 고정</span>
            </label>
          </div>
          
          <div className="flex justify-between">
            <Link
              href={`/notices/${params.id}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              취소
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition dark:bg-indigo-700 dark:hover:bg-indigo-800"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
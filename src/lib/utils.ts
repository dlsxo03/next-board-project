/**
 * 날짜를 포맷팅하는 함수
 * @param date 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열 (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 텍스트를 주어진 길이로 자르는 함수
 * @param text 원본 텍스트
 * @param maxLength 최대 길이
 * @returns 잘린 텍스트 (필요시 말줄임표 추가)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * HTML 태그를 제거하는 함수
 * @param html HTML 문자열
 * @returns HTML 태그가 제거된 문자열
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
} 
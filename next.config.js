/** @type {import('next').NextConfig} */
const nextConfig = {
  // 업로드된 이미지 표시를 위한 이미지 도메인 설정
  images: {
    domains: ['localhost'],
  },
};

module.exports = {
  ...nextConfig,
  env: {
    OLLAMA_URL: process.env.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  },
}; 
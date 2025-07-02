# Next Board Project

Next.js와 Prisma를 사용한 현대적인 게시판 애플리케이션입니다.

## 🚀 주요 기능

- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **게시판 시스템**: 게시글 작성/수정/삭제, 카테고리 분류, 이미지 업로드
- **댓글 시스템**: 게시글별 댓글 작성 및 관리
- **공지사항**: 관리자 전용 공지사항 관리
- **관리자 기능**: 사용자 및 콘텐츠 관리
- **AI 채팅**: Ollama 연동 실시간 채팅 기능
- **반응형 UI**: 다크 모드 지원, 모바일 친화적 디자인

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.2.3** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **next-themes** - 다크 모드

### Backend
- **Next.js API Routes** - 서버 API
- **Prisma** - ORM
- **MySQL** - 데이터베이스
- **NextAuth.js** - 인증 시스템
- **Ollama** - AI 채팅 모델

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd next-board-project
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL="mysql://username:password@localhost:3306/next_board"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Ollama 설정
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="deepseek-r1:latest"

# 파일 업로드 (선택사항)
UPLOAD_DIR="public/uploads"
```

### 4. Ollama 설치 및 실행
```bash
# Ollama 설치 (https://ollama.ai)
# 모델 다운로드
ollama pull deepseek-r1:latest

# Ollama 서버 실행
ollama serve
```

### 5. 데이터베이스 설정
```bash
# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 생성 (선택사항)
npm run db:seed
```

### 6. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 🤖 AI 채팅 기능

### 특징
- **Ollama 연동**: 로컬 AI 모델을 활용한 실시간 채팅
- **스트리밍 응답**: 실시간으로 생성되는 답변 표시
- **마크다운 지원**: 코드 블록, 링크 등 마크다운 렌더링
- **대화 기록**: 브라우저 로컬 스토리지에 대화 내용 저장
- **반응형 UI**: 크기 조절 가능한 채팅 패널

### 사용법
1. 화면 우하단의 💬 버튼을 클릭하여 채팅창 열기
2. 메시지를 입력하고 Enter 키 또는 전송 버튼 클릭
3. AI가 실시간으로 답변을 생성하여 표시
4. 대화 기록은 자동으로 저장되며, 초기화 버튼으로 삭제 가능

### 지원 모델
- `deepseek-r1:latest` (기본값)
- `exaone3.5:latest`
- 기타 Ollama에서 지원하는 모든 모델

## 📁 프로젝트 구조

```
next-board-project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   ├── auth/              # 인증 페이지
│   │   ├── dashboard/         # 대시보드
│   │   ├── notices/           # 공지사항
│   │   ├── posts/             # 게시판
│   │   └── profile/           # 프로필 관리
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   └── Chatbot.tsx        # AI 채팅 컴포넌트
│   └── lib/                   # 유틸리티 및 설정
├── prisma/                    # 데이터베이스 스키마
└── public/                    # 정적 파일
```

## 🔧 사용 가능한 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 코드 린팅
npm run lint

# 데이터베이스 마이그레이션
npm run db:migrate

# 시드 데이터 생성
npm run db:seed

# 데이터베이스 초기화
npm run db:reset
```

## 🗄️ 데이터베이스 스키마

### 주요 모델
- **User**: 사용자 정보 및 권한
- **Post**: 게시글 (제목, 내용, 카테고리, 이미지)
- **Comment**: 댓글 (게시글과 연결)
- **Notice**: 공지사항 (관리자 전용)

## 🔐 인증 시스템

NextAuth.js를 사용한 세션 기반 인증:
- 이메일/비밀번호 로그인
- 세션 관리
- 권한 기반 접근 제어


---

**Next Board Project** - 현대적인 게시판 솔루션

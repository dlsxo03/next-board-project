import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// 현재 로그인한 사용자 정보를 가져오는 함수
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    
    // 세션이 없는 경우
    if (!session?.user?.email) {
      return null;
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    
    // 사용자가 존재하지 않는 경우
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("인증 정보 조회 오류:", error);
    return null;
  }
}

// 관리자 권한 확인 함수
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}

// 사용자 ID 가져오기 함수
export async function getUserId() {
  const user = await getCurrentUser();
  return user?.id;
} 
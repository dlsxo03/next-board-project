import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavBar from "@/components/NavBar";
import Chatbot from "@/components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js 게시판",
  description: "Next.js와 Prisma를 활용한 게시판 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}>
              <main style={{ flex: 1, minWidth: 0, minHeight: 0, height: '100%' }}>{children}</main>
              <Chatbot />
            </div>
            <footer className="bg-gray-800 text-white py-6">
              <div className="container mx-auto px-4">
                <p className="text-center text-sm">
                  © {new Date().getFullYear()} Next.js 게시판 프로젝트. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

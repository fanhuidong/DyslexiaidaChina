import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Global/Footer";
import Header from "@/components/Global/Header";
import AccessibilityToolbar from "@/components/AccessibilityToolbar"; // 👈 引入组件

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Understood Clone - For Learning Differences",
  description: "Shape the world for difference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      {/* flex flex-col min-h-screen: 
        这是为了实现“Sticky Footer”布局，确保当内容较少时，
        Footer 依然沉底，不会飘在屏幕中间。
      */}
      <body className={`${inter.className} bg-background text-secondary antialiased flex flex-col min-h-screen`}>
        
        {/* 顶部导航栏 (引入独立组件) */}
        <Header />

        {/* 主要内容区域 (flex-grow 会自动撑开剩余空间) */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 底部页脚 */}
        <Footer />

        {/* 无障碍工具栏 */}
        <AccessibilityToolbar />

      </body>
    </html>
  );
}
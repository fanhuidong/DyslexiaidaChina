"use client"; // 告诉 Next.js 这是一个有点击交互的组件

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "首页", href: "/" },
    { name: "关于我们", href: "/about" },
    { name: "最新资讯", href: "/news" },
    { name: "帮助中心", href: "/help" },
  ];

  return (
    <nav className="bg-secondary text-white sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto flex justify-between items-center h-20">
        {/* Logo 部分 */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-sm font-black text-2xl">IDA</div>
          <span className="hidden lg:block font-bold text-lg tracking-tight uppercase">
            Dyslexia Association
          </span>
        </Link>

        {/* 桌面端菜单 */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className="font-medium hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <Link 
            href="/donate" 
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105"
          >
            DONATE
          </Link>
        </div>

        {/* 移动端汉堡菜单按钮 */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-2xl">
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {isOpen && (
        <div className="md:hidden bg-secondary-light border-t border-blue-900 px-4 py-4 space-y-4">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="block text-lg border-b border-blue-800 pb-2">
              {item.name}
            </Link>
          ))}
          <Link href="/donate" className="block bg-primary text-center py-3 rounded-md font-bold">
            DONATE
          </Link>
        </div>
      )}
    </nav>
  );
}
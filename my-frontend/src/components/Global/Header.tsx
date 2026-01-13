"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, ChevronDown, User, Heart } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${isScrolled ? 'shadow-xl' : ''}`}>
      
      {/* 1. 顶栏 (Top Utility Bar) */}
      <div className="bg-[#b91c1c] text-white py-2.5 text-xs font-bold tracking-wider uppercase">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* 左侧占位链接 */}
          <div className="hidden md:flex space-x-6">
            <span className="opacity-80 cursor-not-allowed">专家名录</span>
            <span className="opacity-80 cursor-not-allowed">分支机构</span>
            <span className="opacity-80 cursor-not-allowed">在线商店</span>
          </div>
          {/* 右侧功能区 */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
            <Link href="/login" className="flex items-center hover:opacity-80">
              <User className="w-3.5 h-3.5 mr-1" /> 登录
            </Link>
            <div className="h-4 w-px bg-white/30 hidden md:block"></div>
            <Link href="/donate" className="flex items-center hover:opacity-80">
              <Heart className="w-3.5 h-3.5 mr-1" /> 捐赠
            </Link>
            <Link href="/join" className="bg-white text-[#b91c1c] px-4 py-1 rounded-sm hover:bg-gray-100 transition-colors ml-2">
              加入我们
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 主导航栏 (Main Navigation) */}
      <div className="bg-white border-b border-gray-100 h-24 relative">
        <div className="container mx-auto h-full flex justify-between items-center px-4">
          
          {/* Logo 区域 */}
          <Link href="/" className="flex flex-col justify-center h-full group shrink-0">
            <span className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tighter leading-none group-hover:opacity-90">
              DyslexiaidaChina
            </span>
            <span className="text-[10px] md:text-xs text-[#b91c1c] font-bold tracking-[0.2em] uppercase mt-1">
              ...until everyone can read!
            </span>
          </Link>

          {/* 桌面端菜单 (Desktop Menu) */}
          <nav className="hidden lg:flex items-center space-x-1 h-full">
            <Link href="/about" className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#b91c1c] transition-colors">
              关于我们
            </Link>

            {/* 👇 "关于阅读障碍" 下拉菜单 */}
            <div className="group h-full flex items-center relative">
              <button className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 group-hover:text-[#b91c1c] transition-colors focus:outline-none">
                关于阅读障碍 <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              
              <div className="absolute top-full left-0 w-72 bg-white shadow-xl border-t-4 border-[#b91c1c] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="py-2 flex flex-col">
                  {/* 1. 阅读障碍概览 */}
                  <DropdownLink href="/dyslexia-at-a-glance">阅读障碍概览</DropdownLink>
                  {/* 2. 我患有阅读障碍吗 */}
                  <DropdownLink href="/do-i-have-dyslexia">我患有阅读障碍吗？</DropdownLink>
                  {/* 3. 障碍的定义 */}
                  <DropdownLink href="/definition">阅读障碍的定义</DropdownLink>
                  {/* 4. 常见问题解答 */}
                  <DropdownLink href="/faq">常见问题解答</DropdownLink>
                  {/* 5. 世界各地的阅读障碍 */}
                  <DropdownLink href="/dyslexia-around-the-world">世界各地的阅读障碍</DropdownLink>
                  {/* 6. 情况说明书 */}
                  <DropdownLink href="/fact-sheets">情况说明书</DropdownLink>
                  {/* 7. 成功案例 */}
                  <DropdownLink href="/success-stories">成功案例</DropdownLink>
                  {/* 8. 信息图表 */}
                  <DropdownLink href="/infographics">信息图表</DropdownLink>
                  {/* 9. 结构化读写能力意识宣传活动 */}
                  <DropdownLink href="/structured-literacy-campaign">结构化读写能力宣传活动</DropdownLink>
                </div>
              </div>
            </div>

            <Link href="/category/family" className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#b91c1c] transition-colors">
              家庭资源
            </Link>
            <Link href="/category/campus" className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#b91c1c] transition-colors">
              校园支持
            </Link>

            <button className="ml-6 p-2 text-gray-400 hover:text-[#b91c1c] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </nav>

          {/* 移动端菜单按钮 (Mobile Menu Button) */}
          <button 
            className="lg:hidden p-2 text-gray-700"
            onClick={toggleMenu}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* 3. 移动端菜单 (Mobile Menu) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col p-4 font-bold text-gray-700">
            <Link href="/about" className="py-3 border-b border-gray-50">关于我们</Link>
            
            <div className="py-3 border-b border-gray-50 bg-gray-50 -mx-4 px-4">
              <div className="text-[#b91c1c] mb-2 px-2">关于阅读障碍</div>
              <div className="pl-4 flex flex-col space-y-3 text-sm font-medium text-gray-600">
                <Link href="/dyslexia-at-a-glance">阅读障碍概览</Link>
                <Link href="/do-i-have-dyslexia">我患有阅读障碍吗？</Link>
                <Link href="/definition">阅读障碍的定义</Link>
                <Link href="/faq">常见问题解答</Link>
                <Link href="/dyslexia-around-the-world">世界各地的阅读障碍</Link>
                <Link href="/fact-sheets">情况说明书</Link>
                <Link href="/success-stories">成功案例</Link>
                <Link href="/infographics">信息图表</Link>
                <Link href="/structured-literacy-campaign">结构化读写能力宣传活动</Link>
              </div>
            </div>

            <Link href="/category/family" className="py-3 border-b border-gray-50">家庭资源</Link>
            <Link href="/category/campus" className="py-3 border-b border-gray-50">校园支持</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

// 下拉菜单链接组件
function DropdownLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#b91c1c] hover:pl-8 transition-all duration-200 block border-l-2 border-transparent hover:border-[#b91c1c]"
    >
      {children}
    </Link>
  );
}
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, LogIn, User, LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/MessageBoard/NotificationBell';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userMenuWidth, setUserMenuWidth] = useState<number | undefined>(undefined);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const resourcesMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aboutMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 当路由改变时，关闭移动端菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 同步下拉菜单宽度与按钮宽度
  useEffect(() => {
    if (isUserMenuOpen && userButtonRef.current) {
      const buttonWidth = userButtonRef.current.offsetWidth;
      setUserMenuWidth(buttonWidth);
    }
  }, [isUserMenuOpen, session]);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 关闭移动端菜单
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // 关闭桌面端下拉菜单
  const closeDesktopMenus = () => {
    setIsResourcesMenuOpen(false);
    setIsAboutMenuOpen(false);
  };

  // 处理资源探索菜单的鼠标进入
  const handleResourcesMouseEnter = () => {
    // 清除自己的关闭定时器
    if (resourcesMenuTimeoutRef.current) {
      clearTimeout(resourcesMenuTimeoutRef.current);
      resourcesMenuTimeoutRef.current = null;
    }
    // 立即关闭另一个菜单并清除其定时器
    if (aboutMenuTimeoutRef.current) {
      clearTimeout(aboutMenuTimeoutRef.current);
      aboutMenuTimeoutRef.current = null;
    }
    setIsAboutMenuOpen(false);
    setIsResourcesMenuOpen(true);
  };

  // 处理资源探索菜单的鼠标离开（延迟关闭）
  const handleResourcesMouseLeave = () => {
    resourcesMenuTimeoutRef.current = setTimeout(() => {
      setIsResourcesMenuOpen(false);
    }, 150); // 150ms 延迟，给用户时间移动到下拉菜单
  };

  // 处理关于我们菜单的鼠标进入
  const handleAboutMouseEnter = () => {
    // 清除自己的关闭定时器
    if (aboutMenuTimeoutRef.current) {
      clearTimeout(aboutMenuTimeoutRef.current);
      aboutMenuTimeoutRef.current = null;
    }
    // 立即关闭另一个菜单并清除其定时器
    if (resourcesMenuTimeoutRef.current) {
      clearTimeout(resourcesMenuTimeoutRef.current);
      resourcesMenuTimeoutRef.current = null;
    }
    setIsResourcesMenuOpen(false);
    setIsAboutMenuOpen(true);
  };

  // 处理关于我们菜单的鼠标离开（延迟关闭）
  const handleAboutMouseLeave = () => {
    aboutMenuTimeoutRef.current = setTimeout(() => {
      setIsAboutMenuOpen(false);
    }, 150); // 150ms 延迟，给用户时间移动到下拉菜单
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (resourcesMenuTimeoutRef.current) {
        clearTimeout(resourcesMenuTimeoutRef.current);
      }
      if (aboutMenuTimeoutRef.current) {
        clearTimeout(aboutMenuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${isScrolled ? 'shadow-xl' : ''}`}>
      
      {/* 主导航栏 (Main Navigation) - Sticky 吸顶 */}
      <div className="bg-white border-b border-gray-100 h-24 relative">
        <div className="container mx-auto h-full flex items-center px-4">
          
          {/* Logo 区域 - 上下居中，距离屏幕最左边 90px */}
          <Link href="/" className="flex flex-col justify-center h-full group shrink-0 absolute left-[90px]">
            <span className="text-3xl md:text-4xl font-black text-[#1e293b] tracking-tighter leading-none group-hover:opacity-90">
              DyslexiaidaChina
            </span>
            <span className="text-[10px] md:text-xs text-[#5c4ae3] font-bold tracking-[0.2em] uppercase mt-1">
              ...until everyone can read!
            </span>
          </Link>

          {/* 桌面端菜单 (Desktop Menu) - 整体居中 */}
          <nav className="hidden lg:flex items-center space-x-1 h-full mx-auto">
            {/* 👇 "资源探索" 下拉菜单 - 全屏宽度面板 */}
            <div 
              className="h-full flex items-center relative"
              onMouseEnter={handleResourcesMouseEnter}
              onMouseLeave={handleResourcesMouseLeave}
            >
              <button className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#5c4ae3] transition-colors focus:outline-none">
                资源探索 <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              
              {/* Mega Menu：横跨整个屏幕宽度的面板 - 美化设计 */}
              {isResourcesMenuOpen && (
                <div 
                  className="fixed top-24 left-0 w-screen bg-gradient-to-b from-white to-off-white shadow-2xl border-t-4 border-primary transition-all duration-300 transform z-40 opacity-100 visible translate-y-0"
                  onMouseEnter={handleResourcesMouseEnter}
                  onMouseLeave={handleResourcesMouseLeave}
                >
                <div className="container mx-auto px-12 py-20 max-w-7xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                    {/* 关于阅读障碍 */}
                    <div className="flex flex-col relative">
                      <div className="absolute -left-4 top-0 w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                      <div className="text-2xl font-black text-navy mb-10 tracking-tight flex items-center gap-3">
                        <span className="w-3 h-3 bg-primary rounded-full"></span>
                        关于阅读障碍
                      </div>
                      <div className="flex flex-col space-y-3">
                        <DropdownLink href="/definition" onClick={closeDesktopMenus}>阅读障碍是什么</DropdownLink>
                        <DropdownLink href="/dyslexia-at-a-glance" onClick={closeDesktopMenus}>早期迹象</DropdownLink>
                        <DropdownLink href="/faq" onClick={closeDesktopMenus}>阅读障碍的常见问题</DropdownLink>
                        <DropdownLink href="/do-i-have-dyslexia" onClick={closeDesktopMenus}>自我评估</DropdownLink>
                      </div>
                    </div>

                    {/* 寻找帮助 */}
                    <div className="flex flex-col relative">
                      <div className="absolute -left-4 top-0 w-1 h-8 bg-gradient-to-b from-mint-dark to-mint rounded-full"></div>
                      <div className="text-2xl font-black text-navy mb-10 tracking-tight flex items-center gap-3">
                        <span className="w-3 h-3 bg-mint-dark rounded-full"></span>
                        寻找帮助
                      </div>
                      <div className="flex flex-col space-y-3">
                        <DropdownLink href="/help/adult" onClick={closeDesktopMenus}>成人</DropdownLink>
                        <DropdownLink href="/help/teenager" onClick={closeDesktopMenus}>青少年</DropdownLink>
                        <DropdownLink href="/help/educator" onClick={closeDesktopMenus}>教育者</DropdownLink>
                      </div>
                    </div>

                    {/* 更多支持 */}
                    <div className="flex flex-col relative">
                      <div className="absolute -left-4 top-0 w-1 h-8 bg-gradient-to-b from-coral-dark to-coral rounded-full"></div>
                      <div className="text-2xl font-black text-navy mb-10 tracking-tight flex items-center gap-3">
                        <span className="w-3 h-3 bg-coral-dark rounded-full"></span>
                        更多支持
                      </div>
                      <div className="flex flex-col space-y-3">
                        <DropdownLink href="/forum" onClick={closeDesktopMenus}>国际论坛</DropdownLink>
                        <DropdownLink href="/news" onClick={closeDesktopMenus}>我们的动态</DropdownLink>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>

            {/* 👇 "关于我们" 下拉菜单 - 全屏宽度面板 */}
            <div 
              className="h-full flex items-center relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <button className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#5c4ae3] transition-colors focus:outline-none">
                关于我们 <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              
              {/* Mega Menu：横跨整个屏幕宽度的面板 - 美化设计 */}
              {isAboutMenuOpen && (
                <div 
                  className="fixed top-24 left-0 w-screen bg-gradient-to-b from-white to-off-white shadow-2xl border-t-4 border-primary transition-all duration-300 transform z-40 opacity-100 visible translate-y-0"
                  onMouseEnter={handleAboutMouseEnter}
                  onMouseLeave={handleAboutMouseLeave}
                >
                <div className="container mx-auto px-12 py-20 max-w-7xl">
                  <div className="mb-12">
                    <h3 className="text-3xl font-black text-navy tracking-tight flex items-center gap-3">
                      <span className="w-4 h-4 bg-primary rounded-full"></span>
                      了解我们的组织
                    </h3>
                    <p className="text-muted mt-3 text-base">探索我们的使命、团队和合作伙伴</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <DropdownCard href="/about/vision" title="我们的愿景" description="我们的使命与目标" onClick={closeDesktopMenus} />
                    <DropdownCard href="/about/story" title="我们的故事" description="组织发展历程" onClick={closeDesktopMenus} />
                    <DropdownCard href="/about/team" title="我们的团队" description="认识团队成员" onClick={closeDesktopMenus} />
                    <DropdownCard href="/about/contact" title="联系我们" description="获取帮助与支持" onClick={closeDesktopMenus} />
                    <DropdownCard href="/about/partners" title="我们的伙伴" description="合作伙伴网络" onClick={closeDesktopMenus} />
                  </div>
                </div>
                </div>
              )}
            </div>

            {/* 留言板按钮 */}
            <Link href="/message-board" className="h-full flex items-center px-4 text-[15px] font-bold text-gray-700 hover:text-[#5c4ae3] transition-colors">
              留言板
            </Link>
          </nav>

          {/* 用户信息/登录按钮 - 桌面端 - 距离屏幕最右边90px */}
          <div className="hidden lg:flex items-center gap-4 absolute right-[90px]">
            {status === 'loading' ? (
              // 加载中状态
              <div className="px-6 py-2.5">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : session?.user ? (
              // 已登录：显示通知铃铛和用户名下拉菜单
              <>
                <NotificationBell />
                <div className="relative">
                <button 
                  ref={userButtonRef}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-[15px] rounded-full hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap"
                >
                  {session.user.role === 'ADMIN' && (
                    <span className="text-[10px] font-normal opacity-90">管理</span>
                  )}
                  <User className="w-4 h-4" />
                  <span>{session.user.name || session.user.phone || '用户'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* 用户下拉菜单 */}
                {isUserMenuOpen && (
                  <>
                    {/* 点击外部关闭菜单的遮罩层 */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div 
                      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-[60]"
                      style={{ width: userMenuWidth ? `${userMenuWidth}px` : 'auto', minWidth: 'fit-content' }}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name || '用户'}</p>
                          {session.user.role === 'ADMIN' && (
                            <span className="text-[10px] font-normal text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded flex-shrink-0">管理</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{session.user.phone}</p>
                      </div>
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await signOut({ 
                            callbackUrl: '/',
                            redirect: true 
                          });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        type="button"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </>
                )}
                </div>
              </>
            ) : (
              // 未登录：显示登录按钮
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-[15px] rounded-full hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <LogIn className="w-4 h-4" />
                <span>登录</span>
              </Link>
            )}
          </div>

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
            <div className="py-3 border-b border-gray-50 bg-gray-50 -mx-4 px-4">
              <div className="text-[#5c4ae3] mb-2 px-2 font-bold">资源探索</div>
              <div className="pl-4 flex flex-col space-y-4">
                {/* 关于阅读障碍 */}
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-2">关于阅读障碍</div>
                  <div className="pl-2 flex flex-col space-y-2 text-sm font-medium text-gray-600">
                    <Link href="/definition" onClick={closeMobileMenu}>阅读障碍是什么</Link>
                    <Link href="/dyslexia-at-a-glance" onClick={closeMobileMenu}>早期迹象</Link>
                    <Link href="/faq" onClick={closeMobileMenu}>阅读障碍的常见问题</Link>
                    <Link href="/do-i-have-dyslexia" onClick={closeMobileMenu}>自我评估</Link>
                  </div>
                </div>
                {/* 寻找帮助 */}
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-2">寻找帮助</div>
                  <div className="pl-2 flex flex-col space-y-2 text-sm font-medium text-gray-600">
                    <Link href="/category/adult" onClick={closeMobileMenu}>成人</Link>
                    <Link href="/category/teen" onClick={closeMobileMenu}>青少年</Link>
                    <Link href="/category/educator" onClick={closeMobileMenu}>教育者</Link>
                  </div>
                </div>
                {/* 更多支持 */}
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-2">更多支持</div>
                  <div className="pl-2 flex flex-col space-y-2 text-sm font-medium text-gray-600">
                    <Link href="/forum" onClick={closeMobileMenu}>国际论坛</Link>
                    <Link href="/news" onClick={closeMobileMenu}>我们的动态</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-3 border-b border-gray-50 bg-gray-50 -mx-4 px-4">
              <div className="text-[#5c4ae3] mb-2 px-2 font-bold">关于我们</div>
              <div className="pl-4 flex flex-col space-y-3 text-sm font-medium text-gray-600">
                <Link href="/about/vision" onClick={closeMobileMenu}>我们的愿景</Link>
                <Link href="/about/story" onClick={closeMobileMenu}>我们的故事</Link>
                <Link href="/about/team" onClick={closeMobileMenu}>我们的团队</Link>
                <Link href="/about/contact" onClick={closeMobileMenu}>联系我们</Link>
                <Link href="/about/partners" onClick={closeMobileMenu}>我们的伙伴</Link>
              </div>
            </div>

            <Link href="/message-board" className="py-3 border-b border-gray-50" onClick={closeMobileMenu}>留言板</Link>

            {/* 用户信息/登录按钮 - 移动端 */}
            <div className="mt-4 px-4 pb-4">
              {status === 'loading' ? (
                // 加载中状态
                <div className="flex items-center justify-center py-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : session?.user ? (
                // 已登录：显示用户信息和退出按钮
                <div className="space-y-3">
                    <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center relative">
                            {session.user.role === 'ADMIN' && (
                              <span className="absolute -top-1 -left-1 text-[8px] font-normal bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded">管理</span>
                            )}
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">{session.user.name || '用户'}</p>
                              {session.user.role === 'ADMIN' && (
                                <span className="text-[10px] font-normal text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">管理</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{session.user.phone}</p>
                          </div>
                        </div>
                        <NotificationBell />
                      </div>
                    </div>
                  <button
                    onClick={async () => {
                      closeMobileMenu();
                      await signOut({ 
                        callbackUrl: '/',
                        redirect: true 
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold text-base rounded-full hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                    type="button"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>退出登录</span>
                  </button>
                </div>
              ) : (
                // 未登录：显示登录按钮
                <Link 
                  href="/login" 
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold text-base rounded-full hover:bg-primary-hover transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登录</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// 下拉菜单链接组件 - 美化设计
function DropdownLink({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="group/link relative pl-6 pr-4 py-3.5 text-base font-semibold text-gray-800 hover:text-primary hover:bg-primary/8 rounded-lg transition-all duration-200 block"
    >
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 transition-all duration-200 transform scale-0 group-hover/link:scale-100 group-hover/link:translate-x-1"></span>
      <span className="relative z-10 flex items-center">
        <span className="ml-2 group-hover/link:translate-x-1 transition-transform duration-200">{children}</span>
      </span>
    </Link>
  );
}

// 下拉菜单卡片组件 - 用于"关于我们"菜单
function DropdownCard({ href, title, description, onClick }: { href: string, title: string, description: string, onClick?: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="group/card relative p-6 bg-surface border-2 border-transparent hover:border-primary/30 hover:shadow-lg rounded-card transition-all duration-300 block"
    >
      <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"></div>
      <h4 className="text-lg font-bold text-navy mb-2 group-hover/card:text-primary transition-colors duration-200">
        {title}
      </h4>
      <p className="text-sm text-muted leading-relaxed">
        {description}
      </p>
      <div className="mt-4 flex items-center text-primary text-sm font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
        了解更多
        <span className="ml-2 group-hover/card:translate-x-1 transition-transform duration-200">→</span>
      </div>
    </Link>
  );
}
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-20 pb-10 rounded-t-[2.5rem] mt-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* 左侧：Logo 与 订阅模块 */}
          <div className="lg:col-span-5 space-y-8">
            {/* Logo 改名位置 👇 */}
            <h2 className="text-3xl font-black tracking-tight text-white">
              DyslexiaidaChina <span className="text-primary-hover">.</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              致力于为思维和学习方式不同的人，创造更美好的世界。加入我们的社区。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="输入您的邮箱地址" 
                className="px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary w-full"
              />
              <button className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-all flex items-center justify-center whitespace-nowrap">
                订阅 <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 右侧：链接矩阵 */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-6 text-accent">关于我们</h3>
              <ul className="space-y-4 text-gray-300 font-medium">
                <li><Link href="/about" className="hover:text-white transition-colors">我们的使命</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">影响力报告</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">职业机会</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">新闻中心</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-accent">探索主题</h3>
              <ul className="space-y-4 text-gray-300 font-medium">
                <li><Link href="#" className="hover:text-white transition-colors">阅读障碍</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">多动症 (ADHD)</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">运算障碍</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">校园生活</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-6 text-accent">支持与参与</h3>
              <ul className="space-y-4 text-gray-300 font-medium">
                <li><Link href="/donate" className="hover:text-white transition-colors">捐赠支持</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">成为合作伙伴</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">分享你的故事</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">联系我们</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部版权栏 */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link href="#" className="hover:text-white">隐私政策</Link>
            <Link href="#" className="hover:text-white">使用条款</Link>
            <Link href="#" className="hover:text-white">无障碍声明</Link>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
            </div>
            {/* 版权名改名位置 👇 */}
            <span className="ml-4">&copy; 2026 DyslexiaidaChina.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
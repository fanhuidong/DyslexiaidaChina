import { Suspense } from 'react';
import RegisterForm from '@/components/Auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* 卡片容器 */}
        <div className="bg-surface rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-navy mb-2">
              创建账号
            </h1>
            <p className="text-text-secondary text-sm">
              填写信息以注册新账号
            </p>
          </div>

          {/* 注册表单 */}
          <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
            <RegisterForm />
          </Suspense>

          {/* 返回首页链接 */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

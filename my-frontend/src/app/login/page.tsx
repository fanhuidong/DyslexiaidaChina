import { Suspense } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import Link from 'next/link';

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const showSuccess = params.registered === 'true';

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* 卡片容器 */}
        <div className="bg-surface rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-navy mb-2">
              欢迎回来
            </h1>
            <p className="text-text-secondary text-sm">
              登录您的账号以继续
            </p>
          </div>

          {/* 注册成功提示 */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              注册成功！请使用您的账号登录。
            </div>
          )}

          {/* 登录表单 */}
          <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
            <LoginForm />
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

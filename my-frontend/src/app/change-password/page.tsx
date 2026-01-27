import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ChangePasswordForm from '@/components/Auth/ChangePasswordForm';
import Link from 'next/link';

export default async function ChangePasswordPage() {
  const session = await auth();

  // 如果未登录，重定向到登录页
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* 卡片容器 */}
        <div className="bg-surface rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-navy mb-2">
              修改密码
            </h1>
            <p className="text-text-secondary text-sm">
              通过手机验证码修改您的密码
            </p>
          </div>

          {/* 修改密码表单 */}
          <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
            <ChangePasswordForm phone={session.user.phone || ''} />
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

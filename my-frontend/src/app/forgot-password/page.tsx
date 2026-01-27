import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* 卡片容器 */}
        <div className="bg-surface rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-navy mb-2">
              找回密码
            </h1>
            <p className="text-text-secondary text-sm">
              通过手机验证码重置您的密码
            </p>
          </div>

          {/* 找回密码表单 */}
          <Suspense fallback={<div className="text-center py-8">加载中...</div>}>
            <ForgotPasswordForm />
          </Suspense>

          {/* 返回登录链接 */}
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-text-muted hover:text-primary transition-colors"
            >
              ← 返回登录
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      });

      if (result?.error) {
        // 根据错误类型显示不同的错误信息
        if (result.error === 'CredentialsSignin') {
          setError('手机号或密码错误');
        } else {
          setError(result.error || '登录失败，请稍后重试');
        }
      } else if (result?.ok) {
        // 登录成功，跳转到首页
        router.push('/');
        router.refresh();
      } else {
        setError('登录失败，请稍后重试');
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      // 检查是否是 AUTH_SECRET 缺失的错误
      if (err?.message?.includes('AUTH_SECRET') || err?.message?.includes('secret')) {
        setError('服务器配置错误，请联系管理员');
      } else {
        setError('登录失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 手机号输入框 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-2">
          手机号
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isLoading}
            maxLength={11}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入手机号"
          />
        </div>
      </div>

      {/* 密码输入框 */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
          密码
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入密码"
          />
        </div>
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>登录中...</span>
          </>
        ) : (
          <span>登录</span>
        )}
      </button>

      {/* 注册链接 */}
      <div className="text-center pt-4">
        <p className="text-sm text-text-secondary">
          没有账号？{' '}
          <Link href="/register" className="text-primary font-semibold hover:text-primary-hover transition-colors">
            去注册
          </Link>
        </p>
      </div>
    </form>
  );
}

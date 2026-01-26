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
  const [success, setSuccess] = useState('');

  // 账号密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      setIsLoading(false);
      return;
    }

    // 验证密码
    if (!password || password.length < 6) {
      setError('请输入密码（至少6位）');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
        callbackUrl: '/', // 设置回调 URL 为主页
      });

      if (result?.error) {
        // 根据错误类型显示不同的错误信息
        if (result.error === 'CredentialsSignin') {
          setError('手机号或密码错误，请检查后重试');
        } else {
          setError(result.error || '登录失败，请稍后重试');
        }
        setIsLoading(false);
      } else if (result?.ok) {
        // 登录成功，跳转到首页
        setSuccess('登录成功，正在跳转...');
        // 使用 window.location 确保完全刷新页面和 session
        window.location.href = '/';
      } else {
        setError('登录失败，请稍后重试');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      // 检查是否是 AUTH_SECRET 缺失的错误
      if (err?.message?.includes('AUTH_SECRET') || err?.message?.includes('secret')) {
        setError('服务器配置错误，请联系管理员');
      } else {
        setError('登录失败，请检查网络连接后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 成功提示 */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handlePasswordLogin} className="space-y-6">
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
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                setPhone(value);
                setError('');
              }}
              required
              disabled={isLoading}
              maxLength={11}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="请输入11位手机号"
            />
          </div>
          {phone && !/^1[3-9]\d{9}$/.test(phone) && (
            <p className="text-xs text-red-500 mt-1">请输入正确的手机号格式</p>
          )}
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
    </div>
  );
}

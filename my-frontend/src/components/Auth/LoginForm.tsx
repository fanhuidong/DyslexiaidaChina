'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock, MessageSquare } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 发送验证码
  const handleSendCode = async () => {
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          type: 'login',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证码发送失败，请稍后重试');
        return;
      }

      setSuccess('验证码已发送，请查收短信');
      // 开始倒计时（60秒）
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 开发环境显示验证码
      if (data.code) {
        console.log('📱 验证码:', data.code);
      }
    } catch (err) {
      setError('验证码发送失败，请检查网络连接后重试');
      console.error('发送验证码错误:', err);
    } finally {
      setIsSendingCode(false);
    }
  };

  // 手机登录
  const handleSMSLogin = async (e: React.FormEvent) => {
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

    // 验证验证码
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      setIsLoading(false);
      return;
    }

    try {
      // 调用短信登录API
      const response = await fetch('/api/auth/sms-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败，请稍后重试');
        setIsLoading(false);
        return;
      }

      // 登录成功，使用 NextAuth 创建 session
      const result = await signIn('credentials', {
        phone,
        password: 'sms_verified',
        redirect: false,
        callbackUrl: '/',
      });

      if (result?.error) {
        setError('登录失败，请稍后重试');
        setIsLoading(false);
      } else if (result?.ok) {
        setSuccess('登录成功，正在跳转...');
        window.location.href = '/';
      } else {
        setError('登录失败，请稍后重试');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('登录错误:', err);
      setError('登录失败，请检查网络连接后重试');
      setIsLoading(false);
    }
  };

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

      {/* 登录方式切换 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => {
            setLoginMethod('password');
            setError('');
            setSuccess('');
            setVerificationCode('');
          }}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            loginMethod === 'password'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          密码登录
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod('sms');
            setError('');
            setSuccess('');
            setPassword('');
          }}
          className={`flex-1 py-2 text-sm font-semibold transition-colors ${
            loginMethod === 'sms'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          手机登录
        </button>
      </div>

      {loginMethod === 'password' ? (
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

        {/* 注册链接和找回密码 */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-sm text-text-secondary">
            没有账号？{' '}
            <Link href="/register" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              去注册
            </Link>
          </p>
          <p className="text-sm text-text-secondary">
            <Link href="/forgot-password" className="text-primary hover:text-primary-hover transition-colors">
              忘记密码？
            </Link>
          </p>
        </div>
      </form>
      ) : (
        <form onSubmit={handleSMSLogin} className="space-y-6">
          {/* 手机号输入框 */}
          <div>
            <label htmlFor="phone-sms" className="block text-sm font-semibold text-text-primary mb-2">
              手机号
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                id="phone-sms"
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

          {/* 验证码输入框 */}
          <div>
            <label htmlFor="verificationCode-login" className="block text-sm font-semibold text-text-primary mb-2">
              验证码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  id="verificationCode-login"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setError('');
                  }}
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="请输入6位验证码"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0 || !phone || !/^1[3-9]\d{9}$/.test(phone) || isLoading}
                className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap text-sm font-semibold"
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    发送中
                  </>
                ) : countdown > 0 ? (
                  `${countdown}秒后重试`
                ) : (
                  '发送验证码'
                )}
              </button>
            </div>
            {verificationCode && verificationCode.length !== 6 && (
              <p className="text-xs text-red-500 mt-1">请输入6位数字验证码</p>
            )}
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
      )}
    </div>
  );
}

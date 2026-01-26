'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock, Shield, MessageSquare } from 'lucide-react';

type LoginMode = 'password' | 'code';

export default function LoginForm() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devCode, setDevCode] = useState(''); // 开发模式下显示的验证码

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请先输入正确的手机号');
      return;
    }

    setIsSendingCode(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          type: 'LOGIN',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证码发送失败，请稍后重试');
        return;
      }

      setCodeSent(true);
      // 开发模式下显示验证码
      if (data.code) {
        setDevCode(data.code);
        setSuccess(`验证码已发送！开发模式验证码: ${data.code}`);
      } else {
        setSuccess('验证码已发送，请查看手机短信');
      }
      setCountdown(60); // 60秒倒计时

      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('验证码发送失败，请检查网络连接后重试');
      console.error('发送验证码错误:', err);
    } finally {
      setIsSendingCode(false);
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

  // 验证码登录
  const handleCodeLogin = async (e: React.FormEvent) => {
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
      const result = await signIn('verification-code', {
        phone,
        code: verificationCode,
        redirect: false,
        callbackUrl: '/', // 设置回调 URL 为主页
      });

      if (result?.error) {
        // 根据错误类型显示不同的错误信息
        if (result.error === 'CredentialsSignin') {
          setError('验证码错误或已过期，请重新获取');
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
      setError('登录失败，请检查网络连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换登录方式时重置状态
  const handleModeSwitch = (mode: LoginMode) => {
    setLoginMode(mode);
    setError('');
    setSuccess('');
    setPassword('');
    setVerificationCode('');
    setCodeSent(false);
    setCountdown(0);
    setDevCode('');
  };

  return (
    <div className="space-y-6">
      {/* 登录方式切换 */}
      <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => handleModeSwitch('password')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            loginMode === 'password'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            <span>账号密码登录</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('code')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            loginMode === 'code'
              ? 'bg-white text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>手机验证码登录</span>
          </div>
        </button>
      </div>

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

      <form
        onSubmit={loginMode === 'password' ? handlePasswordLogin : handleCodeLogin}
        className="space-y-6"
      >
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
                if (loginMode === 'code') {
                  setCodeSent(false);
                  setVerificationCode('');
                }
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

        {/* 密码登录模式 */}
        {loginMode === 'password' && (
          <>
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
          </>
        )}

        {/* 验证码登录模式 */}
        {loginMode === 'code' && (
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-semibold text-text-primary mb-2">
              验证码
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                disabled={
                  isSendingCode ||
                  countdown > 0 ||
                  isLoading ||
                  !phone ||
                  !/^1[3-9]\d{9}$/.test(phone)
                }
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSendingCode ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}秒`
                ) : (
                  '发送验证码'
                )}
              </button>
            </div>
            {codeSent && (
              <div className="mt-1">
                {devCode ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-semibold mb-1">📱 开发模式验证码：</p>
                    <p className="text-lg text-blue-900 font-mono font-bold text-center">{devCode}</p>
                    <p className="text-xs text-blue-600 mt-1 text-center">（此验证码仅在开发模式下显示）</p>
                  </div>
                ) : (
                  <p className="text-xs text-green-600">
                    验证码已发送，请查看手机短信
                  </p>
                )}
              </div>
            )}
          </div>
        )}

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

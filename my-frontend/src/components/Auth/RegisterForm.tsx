'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock, Shield } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请先输入正确的手机号');
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
          type: 'REGISTER',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '验证码发送失败');
        return;
      }

      setCodeSent(true);
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
      setError('验证码发送失败，请稍后重试');
      console.error('发送验证码错误:', err);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    // 验证验证码
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败，请稍后重试');
        return;
      }

      // 注册成功，跳转到登录页
      router.push('/login?registered=true');
    } catch (err) {
      setError('注册失败，请稍后重试');
      console.error('注册错误:', err);
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
            onChange={(e) => {
              setPhone(e.target.value);
              setCodeSent(false); // 手机号改变时重置验证码状态
            }}
            required
            disabled={isLoading}
            maxLength={11}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入手机号"
          />
        </div>
      </div>

      {/* 验证码输入框 */}
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
            disabled={isSendingCode || countdown > 0 || isLoading || !phone || !/^1[3-9]\d{9}$/.test(phone)}
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
          <p className="text-xs text-green-600 mt-1">验证码已发送，请查看控制台（开发模式）</p>
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
            placeholder="请输入密码（至少6位）"
          />
        </div>
      </div>

      {/* 确认密码输入框 */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-2">
          确认密码
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请再次输入密码"
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
            <span>注册中...</span>
          </>
        ) : (
          <span>注册</span>
        )}
      </button>

      {/* 登录链接 */}
      <div className="text-center pt-4">
        <p className="text-sm text-text-secondary">
          已有账号？{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
            去登录
          </Link>
        </p>
      </div>
    </form>
  );
}

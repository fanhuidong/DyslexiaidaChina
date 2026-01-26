'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Phone, Lock, Shield, User } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
          type: 'REGISTER',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证用户名
    if (!username || username.trim().length === 0) {
      setError('请输入用户名');
      return;
    }

    // 验证用户名长度（2-20个字符）
    if (username.trim().length < 2) {
      setError('用户名至少需要2个字符');
      return;
    }

    if (username.trim().length > 20) {
      setError('用户名不能超过20个字符');
      return;
    }

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }

    // 验证验证码
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致，请检查后重试');
      return;
    }

    setIsLoading(true);
    setSuccess('正在注册，请稍候...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          phone,
          password,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '注册失败，请稍后重试');
        setSuccess('');
        return;
      }

      // 注册成功，显示提示并跳转
      setSuccess('注册成功！正在跳转到登录页面...');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1000);
    } catch (err) {
      setError('注册失败，请检查网络连接后重试');
      setSuccess('');
      console.error('注册错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* 用户名输入框 */}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold text-text-primary mb-2">
          用户名 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            required
            disabled={isLoading}
            maxLength={20}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入用户名（2-20个字符）"
          />
        </div>
        {username && username.trim().length > 0 && username.trim().length < 2 && (
          <p className="text-xs text-red-500 mt-1">用户名至少需要2个字符</p>
        )}
        {username && username.trim().length >= 2 && username.trim().length <= 20 && (
          <p className="text-xs text-green-600 mt-1">用户名格式正确</p>
        )}
        {username && username.trim().length > 20 && (
          <p className="text-xs text-red-500 mt-1">用户名不能超过20个字符</p>
        )}
      </div>

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
              setCodeSent(false); // 手机号改变时重置验证码状态
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
          <p className="text-xs text-red-500 mt-1">请输入正确的手机号格式（11位数字，以1开头）</p>
        )}
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
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入密码（至少6位）"
          />
        </div>
        {password && password.length > 0 && password.length < 6 && (
          <p className="text-xs text-red-500 mt-1">密码长度至少为6位</p>
        )}
        {password && password.length >= 6 && (
          <p className="text-xs text-green-600 mt-1">密码强度符合要求</p>
        )}
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请再次输入密码"
          />
        </div>
        {confirmPassword && password && confirmPassword !== password && (
          <p className="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
        )}
        {confirmPassword && password && confirmPassword === password && password.length >= 6 && (
          <p className="text-xs text-green-600 mt-1">密码确认成功</p>
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

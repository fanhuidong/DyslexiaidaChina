'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, MessageSquare, Phone } from 'lucide-react';

interface ChangePasswordFormProps {
  phone: string;
}

export default function ChangePasswordForm({ phone }: ChangePasswordFormProps) {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 发送验证码
  const handleSendCode = async () => {
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
          type: 'change-password',
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

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 验证验证码
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    // 验证密码匹配
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致，请检查后重试');
      return;
    }

    setIsLoading(true);
    setSuccess('正在修改密码，请稍候...');

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code: verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '密码修改失败，请稍后重试');
        setSuccess('');
        return;
      }

      // 修改成功，显示提示并跳转
      setSuccess('密码修改成功！请重新登录...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError('密码修改失败，请检查网络连接后重试');
      setSuccess('');
      console.error('修改密码错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-6">
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

      {/* 手机号显示（只读） */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          手机号
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="tel"
            value={phone}
            disabled
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-text-primary cursor-not-allowed"
          />
        </div>
      </div>

      {/* 验证码输入框 */}
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-semibold text-text-primary mb-2">
          验证码 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              id="verificationCode"
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
            disabled={isSendingCode || countdown > 0 || isLoading}
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

      {/* 新密码输入框 */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-semibold text-text-primary mb-2">
          新密码 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError('');
            }}
            required
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-text-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="请输入新密码（至少6位）"
          />
        </div>
        {newPassword && newPassword.length > 0 && newPassword.length < 6 && (
          <p className="text-xs text-red-500 mt-1">密码长度至少为6位</p>
        )}
        {newPassword && newPassword.length >= 6 && (
          <p className="text-xs text-green-600 mt-1">密码强度符合要求</p>
        )}
      </div>

      {/* 确认密码输入框 */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-2">
          确认密码 <span className="text-red-500">*</span>
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
            placeholder="请再次输入新密码"
          />
        </div>
        {confirmPassword && newPassword && confirmPassword !== newPassword && (
          <p className="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
        )}
        {confirmPassword && newPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
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
            <span>修改中...</span>
          </>
        ) : (
          <span>修改密码</span>
        )}
      </button>
    </form>
  );
}

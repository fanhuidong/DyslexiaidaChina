"use client";

import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, memo, useState } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
  remainingSeconds?: number; // 剩余秒数，用于倒计时
}

function AlertModalComponent({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCloseButton = true,
  remainingSeconds: initialRemainingSeconds,
}: AlertModalProps) {
  // 倒计时状态
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>(
    initialRemainingSeconds
  );

  // 当弹窗打开或 initialRemainingSeconds 变化时，重置倒计时
  useEffect(() => {
    if (isOpen && initialRemainingSeconds !== undefined) {
      setRemainingSeconds(initialRemainingSeconds);
    } else if (!isOpen) {
      // 弹窗关闭时重置
      setRemainingSeconds(undefined);
    }
  }, [isOpen, initialRemainingSeconds]);

  // 倒计时效果 - 使用函数式更新，避免依赖 remainingSeconds
  useEffect(() => {
    if (!isOpen || initialRemainingSeconds === undefined || initialRemainingSeconds <= 0) {
      return;
    }

    // 设置定时器，每秒减1
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === undefined || prev === null || prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, initialRemainingSeconds]);

  if (!isOpen) {
    return null;
  }

  // 根据类型选择图标和颜色 - 使用项目设计系统
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-mint-dark',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-coral-dark',
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-primary',
        };
    }
  };

  const { icon: Icon, iconColor } = getIconAndColor();

  // 处理换行符
  const formattedMessage = message.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < message.split('\n').length - 1 && <br />}
    </span>
  ));

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 - 更柔和的半透明效果 */}
      <div
        className="absolute inset-0 bg-gray-500/10 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框内容 - 小清新风格 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 z-10 transform transition-all duration-200 animate-in fade-in zoom-in-95">
        {/* 关闭按钮 - 更简洁 */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="p-6">
          {/* 图标 - 居中显示，更清新 */}
          <div className="flex justify-center mb-4">
            <div className={`${iconColor} bg-opacity-10 rounded-full p-3`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          
          {/* 标题和内容 */}
          <div className="text-center mb-6">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            <div className={`text-sm ${title ? 'text-gray-600' : 'text-gray-700'} leading-relaxed`}>
              {formattedMessage}
            </div>
            
            {/* 倒计时 - 更清新的样式 */}
            {remainingSeconds !== undefined && remainingSeconds >= 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-sm text-primary font-medium">
                  还需等待 <span className="text-base font-bold">{remainingSeconds}</span> 秒
                </span>
              </div>
            )}
          </div>
          
          {/* 确认按钮 - 更简洁的样式 */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                type === 'error'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : type === 'warning'
                  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  : type === 'success'
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 导出组件（移除 memo 以确保倒计时能正常更新）
export const AlertModal = AlertModalComponent;

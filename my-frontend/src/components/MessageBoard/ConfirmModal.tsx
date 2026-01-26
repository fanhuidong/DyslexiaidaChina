"use client";

import { AlertCircle, X } from 'lucide-react';
import { useEffect, memo } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonType?: 'danger' | 'primary';
}

function ConfirmModalComponent({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  confirmButtonType = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-6">
          {/* 图标 - 居中显示 */}
          <div className="flex justify-center mb-4">
            <div className="text-amber-500 bg-amber-50 rounded-full p-3">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          
          {/* 标题和内容 */}
          <div className="text-center mb-6">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            <div className="text-sm text-gray-600 leading-relaxed">
              {message}
            </div>
          </div>
          
          {/* 按钮 - 更简洁的样式 */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                confirmButtonType === 'danger'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用 memo 优化组件，避免不必要的重渲染
export const ConfirmModal = memo(ConfirmModalComponent);

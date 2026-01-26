"use client";

import { X } from 'lucide-react';
import Link from 'next/link';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            请先登录
          </h2>
          <p className="text-gray-600 mb-6">
            请先登录后参与讨论
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <Link
              href="/login"
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
            >
              去登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

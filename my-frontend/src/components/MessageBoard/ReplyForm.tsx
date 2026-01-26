"use client";

import { useState } from 'react';
import { Send, X } from 'lucide-react';

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string | null;
  };
}

interface ReplyFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  replyingTo?: Reply | null;
}

export function ReplyForm({ onSubmit, onCancel, replyingTo }: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('请输入回复内容');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyingTo && (
        <div className="text-sm text-gray-600 mb-2">
          回复 <span className="font-semibold">{replyingTo.author.nickname || '匿名用户'}</span>:
        </div>
      )}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyingTo ? '写下你的回复...' : '写下你的评论...'}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          disabled={submitting}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>
    </form>
  );
}

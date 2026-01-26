"use client";

import { useState } from 'react';
import { Trash2, Reply as ReplyIcon } from 'lucide-react';
import { ReplyForm } from './ReplyForm';

interface Author {
  id: string;
  nickname: string | null;
  avatar: string | null;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  children: Reply[];
}

interface ReplyListProps {
  replies: Reply[];
  currentUserId?: string;
  currentUserRole?: string;
  onReply: (replyId: string) => void;
  onDelete: (replyId: string) => void;
  onReplySubmit: (content: string, parentId?: string) => void;
}

export function ReplyList({
  replies,
  currentUserId,
  currentUserRole,
  onReply,
  onDelete,
  onReplySubmit,
}: ReplyListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const handleReplyClick = (replyId: string) => {
    if (!currentUserId) {
      return;
    }
    setReplyingTo(replyingTo === replyId ? null : replyId);
  };

  const handleReplySubmit = (content: string) => {
    if (replyingTo) {
      onReplySubmit(content, replyingTo);
    } else {
      onReplySubmit(content);
    }
    setReplyingTo(null);
  };

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const canDelete = currentUserRole === 'ADMIN' || reply.author.id === currentUserId;
        const canReply = !!currentUserId;

        return (
          <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                  {reply.author.nickname?.[0]?.toUpperCase() || reply.author.id[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {reply.author.nickname || '匿名用户'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(reply.createdAt)}
                  </div>
                </div>
              </div>
              
              {canDelete && (
                <button
                  onClick={() => onDelete(reply.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="删除回复"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="text-gray-700 text-sm whitespace-pre-wrap break-words mb-2">
              {reply.content}
            </div>

            {canReply && (
              <button
                onClick={() => handleReplyClick(reply.id)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors mb-2"
              >
                <ReplyIcon className="w-3 h-3" />
                <span>回复</span>
              </button>
            )}

            {replyingTo === reply.id && canReply && (
              <div className="mb-2">
                <ReplyForm
                  onSubmit={handleReplySubmit}
                  onCancel={() => setReplyingTo(null)}
                  replyingTo={reply}
                />
              </div>
            )}

            {/* 子回复 */}
            {reply.children && reply.children.length > 0 && (
              <div className="mt-2 ml-4">
                <ReplyList
                  replies={reply.children}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onReply={onReply}
                  onDelete={onDelete}
                  onReplySubmit={onReplySubmit}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

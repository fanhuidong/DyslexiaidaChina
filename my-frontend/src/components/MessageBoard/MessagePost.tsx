"use client";

import { useState } from 'react';
import { MessageSquare, Trash2, Reply as ReplyIcon } from 'lucide-react';
import { ReplyForm } from './ReplyForm';
import { ReplyList } from './ReplyList';

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

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  replies: Reply[];
}

interface MessagePostProps {
  post: Post;
  currentUserId?: string;
  currentUserRole?: string;
  onReply: (postId: string, content: string, parentId?: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteReply: (replyId: string) => void;
}

export function MessagePost({
  post,
  currentUserId,
  currentUserRole,
  onReply,
  onDeletePost,
  onDeleteReply,
}: MessagePostProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const canDelete = currentUserRole === 'ADMIN' || post.author.id === currentUserId;
  const canReply = !!currentUserId;

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

  const handleReplyClick = () => {
    if (!currentUserId) {
      return;
    }
    setShowReplyForm(!showReplyForm);
    setReplyingTo(null);
  };

  const handleReplyToReply = (replyId: string) => {
    if (!currentUserId) {
      return;
    }
    setShowReplyForm(true);
    setReplyingTo(replyId);
  };

  const handleReplySubmit = (content: string) => {
    if (replyingTo) {
      onReply(post.id, content, replyingTo);
    } else {
      onReply(post.id, content);
    }
    setShowReplyForm(false);
    setReplyingTo(null);
  };

  return (
    <div id={`post-${post.id}`} className="bg-white rounded-lg shadow-sm p-6">
      {/* 留言内容 */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {post.author.nickname?.[0]?.toUpperCase() || post.author.id[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {post.author.nickname || '匿名用户'}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </div>
            </div>
          </div>
          
          {canDelete && (
            <button
              onClick={() => onDeletePost(post.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="删除留言"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="text-gray-800 whitespace-pre-wrap break-words">
          {post.content}
        </div>
      </div>

      {/* 回复按钮 */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleReplyClick}
          disabled={!canReply}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            canReply
              ? 'text-primary hover:bg-primary/10'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>评论/回复</span>
          {post.replies.length > 0 && (
            <span className="text-sm">({post.replies.length})</span>
          )}
        </button>
      </div>

      {/* 回复表单 */}
      {showReplyForm && canReply && (
        <div className="mb-4 pl-4 border-l-2 border-primary">
          <ReplyForm
            onSubmit={handleReplySubmit}
            onCancel={() => {
              setShowReplyForm(false);
              setReplyingTo(null);
            }}
            replyingTo={replyingTo ? post.replies.find(r => r.id === replyingTo) : null}
          />
        </div>
      )}

      {/* 回复列表 */}
      {post.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          <ReplyList
            replies={post.replies}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onReply={handleReplyToReply}
            onDelete={onDeleteReply}
            onReplySubmit={(content: string, parentId?: string) => {
              onReply(post.id, content, parentId);
            }}
          />
        </div>
      )}
    </div>
  );
}

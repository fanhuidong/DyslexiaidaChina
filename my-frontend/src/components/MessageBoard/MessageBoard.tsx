"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { MessagePost } from './MessagePost';
import { CreatePostForm } from './CreatePostForm';
import { LoginModal } from './LoginModal';
import { AlertModal } from './AlertModal';
import { ConfirmModal } from './ConfirmModal';
import { Loader2 } from 'lucide-react';
import { safeJsonParse } from '@/lib/fetch-utils';

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

interface MessageBoardProps {}

export function MessageBoard({}: MessageBoardProps) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // 弹窗状态
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    remainingSeconds?: number;
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });
  
  // 确认对话框状态
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmButtonType?: 'danger' | 'primary';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  
  // 显示弹窗的辅助函数
  const showAlert = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    title?: string,
    remainingSeconds?: number
  ) => {
    setAlertModal({ isOpen: true, message, type, title, remainingSeconds });
  };
  
  // 显示确认对话框的辅助函数
  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    confirmButtonType: 'danger' | 'primary' = 'danger'
  ) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm,
      title,
      confirmText,
      cancelText,
      confirmButtonType,
    });
  };
  
  // 关闭弹窗的回调函数 - 使用 useCallback 稳定引用
  const handleCloseAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);
  
  const handleCloseConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/message-board?page=${pageNum}&limit=20`);
      const result = await safeJsonParse(response);
      
      if (result && result.success) {
        if (append) {
          setPosts(prev => [...prev, ...result.data.posts]);
        } else {
          setPosts(result.data.posts);
        }
        setHasMore(result.data.pagination.page < result.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('获取留言失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  const handleCreatePost = async (content: string) => {
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch('/api/message-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const result = await safeJsonParse(response);
      
      if (result && result.success) {
        // 重新获取第一页
        await fetchPosts(1, false);
        setPage(1);
      } else if (result) {
        // 如果是频率限制错误（429），显示更友好的提示
        if (response.status === 429) {
          const remainingSeconds = result.remainingSeconds;
          const message = `您已达到发言频率限制（每分钟最多3条）。`;
          showAlert(message, 'warning', '发言过于频繁', remainingSeconds);
          // 429 是预期的业务限制，不打印为错误
          console.log('频率限制提示已显示:', { remainingSeconds });
        } else {
          // 其他错误
          const errorMsg = result.error || '发布失败';
          showAlert(
            errorMsg,
            'error',
            '发布失败',
            result.remainingSeconds
          );
          console.error('发布失败:', result);
        }
      }
    } catch (error: any) {
      console.error('发布留言失败:', error);
      showAlert(
        error?.message || '网络错误，请检查控制台',
        'error',
        '发布留言失败'
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    showConfirm(
      '确定要删除这条留言吗？删除后无法恢复。',
      async () => {
        try {
          const response = await fetch(`/api/message-board/${postId}`, {
            method: 'DELETE',
          });

          const result = await safeJsonParse(response);
          
          if (result && result.success) {
            // 从列表中移除
            setPosts(prev => prev.filter(p => p.id !== postId));
            showAlert('留言已删除', 'success');
          } else if (result) {
            // 显示具体错误信息
            const errorMsg = result.error || '删除失败';
            showAlert(errorMsg, 'error', '删除失败');
            console.error('删除失败:', result);
          } else {
            // 响应解析失败
            if (!response.ok) {
              showAlert(
                `${response.status} ${response.statusText}`,
                'error',
                '删除失败'
              );
            } else {
              showAlert('无法解析服务器响应', 'error', '删除失败');
            }
          }
        } catch (error: any) {
          console.error('删除留言失败:', error);
          showAlert(
            error?.message || '网络错误，请检查控制台',
            'error',
            '删除留言失败'
          );
        }
      },
      '确认删除',
      '删除',
      '取消'
    );
  };

  const handleReply = async (postId: string, content: string, parentId?: string) => {
    if (!session?.user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/message-board/${postId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, parentId }),
      });

      const result = await safeJsonParse(response);
      
      if (result && result.success) {
        // 重新获取留言列表
        await fetchPosts(page, false);
      } else if (result) {
        const errorMsg = result.error || '回复失败';
        if (result.remainingSeconds !== undefined) {
          showAlert(
            errorMsg,
            'warning',
            '回复失败',
            result.remainingSeconds
          );
        } else {
          showAlert(errorMsg, 'error', '回复失败');
        }
      }
    } catch (error) {
      console.error('回复失败:', error);
      showAlert('回复失败，请重试', 'error');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    showConfirm(
      '确定要删除这条回复吗？',
      async () => {
        try {
          const response = await fetch(`/api/message-board/reply/${replyId}`, {
            method: 'DELETE',
          });

          const result = await safeJsonParse(response);
          
          if (result && result.success) {
            // 重新获取留言列表
            await fetchPosts(page, false);
            showAlert('回复已删除', 'success');
          } else if (result) {
            showAlert(result.error || '删除失败', 'error');
          }
        } catch (error) {
          console.error('删除回复失败:', error);
          showAlert('删除回复失败，请重试', 'error');
        }
      },
      '确认删除',
      '删除',
      '取消'
    );
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <CreatePostForm onSubmit={handleCreatePost} />
        
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">还没有留言，快来发表第一条吧！</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <MessagePost
                key={post.id}
                post={post}
                currentUserId={session?.user?.id}
                currentUserRole={session?.user?.role}
                onReply={handleReply}
                onDeletePost={handleDeletePost}
                onDeleteReply={handleDeleteReply}
              />
            ))}
            
            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
      
      {alertModal.isOpen && (
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={handleCloseAlert}
          message={alertModal.message}
          type={alertModal.type}
          title={alertModal.title}
          remainingSeconds={alertModal.remainingSeconds}
        />
      )}
      
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={handleCloseConfirm}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          title={confirmModal.title}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          confirmButtonType={confirmModal.confirmButtonType}
        />
      )}
    </>
  );
}

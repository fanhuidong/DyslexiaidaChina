"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NotificationPanel } from './NotificationPanel';
import { safeJsonParse } from '@/lib/fetch-utils';

export function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?unreadOnly=true&limit=1');
        const result = await safeJsonParse(response);
        
        if (result && result.success) {
          setUnreadCount(result.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('获取未读通知数失败:', error);
      }
    };

    fetchUnreadCount();
    
    // 每30秒刷新一次未读数量
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [session]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-700 hover:text-primary transition-colors"
        title="通知"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showPanel && (
        <NotificationPanel
          onClose={() => setShowPanel(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </div>
  );
}

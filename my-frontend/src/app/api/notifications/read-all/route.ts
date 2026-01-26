import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * PUT /api/notifications/read-all
 * 标记所有通知为已读
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 标记所有未读通知为已读
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: '已全部标记为已读',
    });
  } catch (error) {
    console.error('标记所有通知失败:', error);
    return NextResponse.json(
      { success: false, error: '标记所有通知失败' },
      { status: 500 }
    );
  }
}

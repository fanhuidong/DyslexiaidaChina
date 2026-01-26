import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * PUT /api/notifications/[id]/read
 * 标记通知为已读
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 处理 params 可能是 Promise 的情况
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    // 检查通知是否存在且属于当前用户
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: '通知不存在' },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作此通知' },
        { status: 403 }
      );
    }

    // 标记为已读
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    console.error('标记通知失败:', error);
    return NextResponse.json(
      { success: false, error: '标记通知失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// 强制动态路由，避免缓存问题
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/message-board/reply/[replyId]
 * 删除回复
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> | { replyId: string } }
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
    const { replyId } = resolvedParams;

    // 查找回复
    const reply = await db.messageBoardReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return NextResponse.json(
        { success: false, error: '回复不存在' },
        { status: 404 }
      );
    }

    // 检查权限：只有管理员或作者可以删除
    if (session.user.role !== 'ADMIN' && reply.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权删除此回复' },
        { status: 403 }
      );
    }

    // 软删除：标记为已删除
    await db.messageBoardReply.update({
      where: { id: replyId },
      data: { isDeleted: true },
    });

    // 同时删除所有子回复
    await db.messageBoardReply.updateMany({
      where: { parentId: replyId },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除回复失败:', error);
    return NextResponse.json(
      { success: false, error: '删除回复失败' },
      { status: 500 }
    );
  }
}

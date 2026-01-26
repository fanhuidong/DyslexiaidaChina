import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// 强制动态路由，避免缓存问题
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/message-board/[postId]
 * 删除留言
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> | { postId: string } }
) {
  try {
    console.log('🔍 [DELETE] 开始处理删除请求');
    console.log('🔍 [DELETE] Params 类型:', params instanceof Promise ? 'Promise' : 'Object');
    console.log('🔍 [DELETE] Params 值:', params);
    
    const session = await auth();
    console.log('🔍 [DELETE] Session:', session?.user ? '已登录' : '未登录');
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 处理 params 可能是 Promise 的情况
    const resolvedParams = params instanceof Promise ? await params : params;
    const { postId } = resolvedParams;
    console.log('🔍 [DELETE] PostId:', postId);
    console.log('🔍 [DELETE] PostId 类型:', typeof postId);
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: '留言ID不能为空' },
        { status: 400 }
      );
    }

    // 检查 db.messageBoardPost 是否存在
    if (!('messageBoardPost' in db)) {
      console.error('❌ [DELETE] db.messageBoardPost 不存在！');
      return NextResponse.json(
        { success: false, error: '数据库模型未加载，请重启服务器' },
        { status: 500 }
      );
    }

    // 查找留言
    console.log('🔍 [DELETE] 查找留言...');
    const post = await db.messageBoardPost.findUnique({
      where: { id: postId },
    });
    console.log('🔍 [DELETE] 留言查找结果:', post ? '找到' : '未找到');

    if (!post) {
      return NextResponse.json(
        { success: false, error: '留言不存在' },
        { status: 404 }
      );
    }

    // 检查权限：只有管理员或作者可以删除
    if (session.user.role !== 'ADMIN' && post.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权删除此留言' },
        { status: 403 }
      );
    }

    // 软删除：标记为已删除
    console.log('🔍 [DELETE] 开始软删除留言...');
    await db.messageBoardPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
    console.log('✅ [DELETE] 留言已标记为已删除');

    // 同时删除所有回复
    console.log('🔍 [DELETE] 开始删除回复...');
    await db.messageBoardReply.updateMany({
      where: { postId },
      data: { isDeleted: true },
    });
    console.log('✅ [DELETE] 回复已标记为已删除');

    console.log('✅ [DELETE] 删除成功');
    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('删除留言失败:', error);
    console.error('错误详情:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    
    // 提供更详细的错误信息
    let errorMessage = '删除留言失败';
    if (error?.code === 'P2003') {
      errorMessage = '关联数据错误，请检查数据库';
    } else if (error?.code === 'P2025') {
      errorMessage = '留言不存在';
    } else if (error?.message) {
      errorMessage = `删除失败: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

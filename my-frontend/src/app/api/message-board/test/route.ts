import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/message-board/test
 * 测试数据库连接和模型
 */
export async function GET(request: NextRequest) {
  try {
    // 检查 db 对象
    const dbKeys = Object.keys(db).filter(key => !key.startsWith('$') && !key.startsWith('_'));
    
    // 检查 messageBoardPost 是否存在
    const hasMessageBoardPost = 'messageBoardPost' in db;
    const messageBoardPostType = typeof (db as any).messageBoardPost;
    
    // 测试数据库连接
    await db.$connect();
    
    // 测试查询 User（确保基本功能正常）
    const userCount = await db.user.count();
    
    // 测试查询 MessageBoardPost（如果存在）
    let postCount = null;
    let postError = null;
    if (hasMessageBoardPost && (db as any).messageBoardPost) {
      try {
        postCount = await (db as any).messageBoardPost.count();
      } catch (err: any) {
        postError = err?.message;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '诊断信息',
      diagnostics: {
        dbKeys: dbKeys.slice(0, 10), // 只显示前10个
        hasMessageBoardPost,
        messageBoardPostType,
        userCount,
        postCount,
        postError,
      },
      recommendation: !hasMessageBoardPost || messageBoardPostType === 'undefined' 
        ? 'Prisma Client 需要重新生成。请停止开发服务器，运行 "npx prisma generate"，然后重启服务器。'
        : '一切正常',
    });
  } catch (error: any) {
    console.error('测试失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '测试失败',
        code: error?.code,
        details: {
          message: error?.message,
          code: error?.code,
          name: error?.name,
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        },
        recommendation: '请检查数据库连接和 Prisma Client 是否正确生成',
      },
      { status: 500 }
    );
  } finally {
    try {
      await db.$disconnect();
    } catch (e) {
      // 忽略断开连接错误
    }
  }
}

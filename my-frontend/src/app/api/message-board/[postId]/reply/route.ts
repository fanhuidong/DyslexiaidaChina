import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { validateContent } from '@/lib/content-filter';
import { checkRateLimit } from '@/lib/rate-limit';

// 强制动态路由，避免缓存问题
export const dynamic = 'force-dynamic';

/**
 * POST /api/message-board/[postId]/reply
 * 回复留言
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> | { postId: string } }
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
    const { postId } = resolvedParams;
    const body = await request.json();
    const { content, parentId } = body;

    // 验证内容
    const validation = validateContent(content);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.message },
        { status: 400 }
      );
    }

    // 使用过滤后的内容（如果内容过长会被截断）
    const finalContent = validation.filteredContent || content.trim();

    // 检查发言频率限制（每分钟最多3条）
    const rateLimitCheck = await checkRateLimit(session.user.id, 3, 1);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateLimitCheck.message || '发言过于频繁，请稍后再试',
          remainingSeconds: rateLimitCheck.remainingSeconds,
        },
        { status: 429 } // 429 Too Many Requests
      );
    }

    // 检查留言是否存在
    const post = await db.messageBoardPost.findUnique({
      where: { id: postId },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });

    if (!post || post.isDeleted) {
      return NextResponse.json(
        { success: false, error: '留言不存在' },
        { status: 404 }
      );
    }

    // 如果 parentId 存在，检查父回复是否存在
    if (parentId) {
      const parentReply = await db.messageBoardReply.findUnique({
        where: { id: parentId },
      });
      if (!parentReply || parentReply.isDeleted || parentReply.postId !== postId) {
        return NextResponse.json(
          { success: false, error: '父回复不存在' },
          { status: 404 }
        );
      }
    }

    // 创建回复
    const reply = await db.messageBoardReply.create({
      data: {
        content: finalContent,
        authorId: session.user.id,
        postId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        children: [],
      },
    });

    // 创建通知
    // 1. 通知留言作者（如果回复者不是作者本人）
    if (post.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: post.authorId,
          content: `${session.user.name || '用户'} 回复了你的留言：${finalContent.substring(0, 50)}${finalContent.length > 50 ? '...' : ''}`,
          type: 'reply',
          relatedId: reply.id,
          link: `/message-board#post-${postId}`,
        },
      });
    }

    // 2. 通知所有在该留言下回复过的人（包括父回复的作者）
    const notifiedUserIds = new Set<string>();
    
    // 如果是对回复的回复，通知父回复的作者
    if (parentId) {
      const parentReply = await db.messageBoardReply.findUnique({
        where: { id: parentId },
        include: { author: true },
      });
      if (parentReply && parentReply.authorId !== session.user.id && parentReply.authorId !== post.authorId) {
        notifiedUserIds.add(parentReply.authorId);
      }
    }

    // 通知该留言下所有回复的作者（排除自己、留言作者、已通知的父回复作者）
    post.replies.forEach((r) => {
      if (
        !r.isDeleted &&
        r.authorId !== session.user.id &&
        r.authorId !== post.authorId &&
        !notifiedUserIds.has(r.authorId)
      ) {
        notifiedUserIds.add(r.authorId);
      }
    });

    // 批量创建通知
    const notifications = Array.from(notifiedUserIds).map((userId) => ({
      userId,
      content: `${session.user.name || '用户'} 回复了你在留言中的评论：${finalContent.substring(0, 50)}${finalContent.length > 50 ? '...' : ''}`,
      type: 'reply',
      relatedId: reply.id,
      link: `/message-board#post-${postId}`,
    }));

    if (notifications.length > 0) {
      await db.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.error('创建回复失败:', error);
    return NextResponse.json(
      { success: false, error: '创建回复失败' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { validateContent } from '@/lib/content-filter';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/message-board
 * 获取留言板列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.messageBoardPost.findMany({
        where: { isDeleted: false },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                  avatar: true,
                },
              },
              children: {
                where: { isDeleted: false },
                include: {
                  author: {
                    select: {
                      id: true,
                      nickname: true,
                      avatar: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.messageBoardPost.count({
        where: { isDeleted: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('获取留言板列表失败:', error);
    console.error('错误详情:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    
    // 提供更详细的错误信息
    let errorMessage = '获取留言板列表失败';
    if (error?.message?.includes('Unknown model') || error?.message?.includes('messageBoardPost')) {
      errorMessage = '数据库模型未找到，请运行: npx prisma generate';
    } else if (error?.code === 'P1001') {
      errorMessage = '数据库连接失败，请检查数据库服务';
    } else if (error?.message) {
      errorMessage = `获取失败: ${error.message}`;
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

/**
 * POST /api/message-board
 * 创建新留言
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: '留言内容不能为空' },
        { status: 400 }
      );
    }

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

    // 检查用户ID是否存在
    if (!session.user.id) {
      return NextResponse.json(
        { success: false, error: '用户信息不完整，请重新登录' },
        { status: 401 }
      );
    }

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

    // 创建留言
    const post = await db.messageBoardPost.create({
      data: {
        content: finalContent,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error('创建留言失败:', error);
    console.error('错误详情:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    
    // 提供更详细的错误信息
    let errorMessage = '创建留言失败';
    if (error?.code === 'P2002') {
      errorMessage = '数据冲突，请重试';
    } else if (error?.code === 'P2003') {
      errorMessage = '用户不存在，请重新登录';
    } else if (error?.message?.includes('Unknown model') || error?.message?.includes('messageBoardPost')) {
      errorMessage = '数据库模型未找到，请运行: npx prisma generate';
    } else if (error?.code === 'P1001') {
      errorMessage = '数据库连接失败，请检查数据库服务';
    } else if (error?.message) {
      errorMessage = `创建留言失败: ${error.message}`;
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

/**
 * 发言频率限制工具
 * 限制用户每分钟最多发言3次（包括留言和回复）
 */

import { db } from './db';

/**
 * 检查用户是否超过发言频率限制
 * @param userId 用户ID
 * @param maxCount 最大发言次数（默认3次）
 * @param timeWindowMinutes 时间窗口（分钟，默认1分钟）
 * @returns 如果超过限制返回错误信息，否则返回 null
 */
export async function checkRateLimit(
  userId: string,
  maxCount: number = 3,
  timeWindowMinutes: number = 1
): Promise<{ allowed: boolean; message?: string; remainingSeconds?: number }> {
  try {
    const now = new Date();
    const timeWindowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);

    // 统计用户最近1分钟内的发言次数（留言 + 回复）
    // 注意：只统计未删除的发言
    const [postCount, replyCount] = await Promise.all([
      db.messageBoardPost.count({
        where: {
          authorId: userId,
          isDeleted: false, // 只统计未删除的
          createdAt: {
            gte: timeWindowStart,
          },
        },
      }),
      db.messageBoardReply.count({
        where: {
          authorId: userId,
          isDeleted: false, // 只统计未删除的
          createdAt: {
            gte: timeWindowStart,
          },
        },
      }),
    ]);

    const totalCount = postCount + replyCount;

    // 调试日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Rate Limit] 用户 ${userId} 最近1分钟内发言: ${totalCount} 条 (留言: ${postCount}, 回复: ${replyCount}), 限制: ${maxCount} 条`);
    }

    // 如果已经达到或超过限制，拒绝（允许发 maxCount 条，第 maxCount+1 条拒绝）
    // 例如：maxCount=3，允许发3条，第4条拒绝
    if (totalCount >= maxCount) {
      // 计算还需要等待的秒数（找到最早的一条发言，计算距离现在的时间）
      const [oldestPost, oldestReply] = await Promise.all([
        db.messageBoardPost.findFirst({
          where: {
            authorId: userId,
            createdAt: {
              gte: timeWindowStart,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
        db.messageBoardReply.findFirst({
          where: {
            authorId: userId,
            createdAt: {
              gte: timeWindowStart,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
      ]);

      let oldestTime: Date | null = null;
      if (oldestPost && oldestReply) {
        oldestTime = oldestPost.createdAt < oldestReply.createdAt 
          ? oldestPost.createdAt 
          : oldestReply.createdAt;
      } else if (oldestPost) {
        oldestTime = oldestPost.createdAt;
      } else if (oldestReply) {
        oldestTime = oldestReply.createdAt;
      }

      if (oldestTime) {
        const elapsedSeconds = Math.floor((now.getTime() - oldestTime.getTime()) / 1000);
        const remainingSeconds = Math.max(0, 60 - elapsedSeconds);
        
        return {
          allowed: false,
          message: `发言过于频繁，请等待 ${remainingSeconds} 秒后再试（每分钟最多 ${maxCount} 条）`,
          remainingSeconds,
        };
      }

      return {
        allowed: false,
        message: `发言过于频繁，请稍后再试（每分钟最多 ${maxCount} 条）`,
      };
    }

    return {
      allowed: true,
    };
  } catch (error) {
    console.error('检查发言频率限制失败:', error);
    // 如果检查失败，允许发言（避免因为技术问题阻止用户）
    return {
      allowed: true,
    };
  }
}

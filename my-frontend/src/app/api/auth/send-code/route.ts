import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/send-code
 * 发送验证码
 * 
 * 请求体:
 * {
 *   "phone": "13800138000",
 *   "type": "REGISTER" // 可选: "REGISTER", "LOGIN", "RESET_PWD"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type = 'REGISTER' } = body;

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确，请输入11位手机号（以1开头）' },
        { status: 400 }
      );
    }

    // 验证类型
    const validTypes = ['REGISTER', 'LOGIN', 'RESET_PWD'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '验证码类型不正确，请使用正确的类型' },
        { status: 400 }
      );
    }

    // 对于登录类型，检查用户是否存在
    if (type === 'LOGIN') {
      try {
        const user = await db.user.findUnique({
          where: { phone },
        });
        if (!user) {
          return NextResponse.json(
            { error: '该手机号未注册，请先注册账号' },
            { status: 404 }
          );
        }
      } catch (dbError: any) {
        console.error('❌ [send-code] 查询用户失败:', dbError);
        // 如果是数据库连接错误，直接抛出
        if (dbError?.code === 'P1001' || dbError?.message?.includes('connect') || dbError?.message?.includes('ECONNREFUSED')) {
          throw new Error('数据库连接失败，请确保 MySQL 服务正在运行');
        }
        throw dbError;
      }
    }

    // 对于注册类型，检查用户是否已存在
    if (type === 'REGISTER') {
      try {
        const existingUser = await db.user.findUnique({
          where: { phone },
        });
        if (existingUser) {
          return NextResponse.json(
            { error: '该手机号已被注册，请直接登录' },
            { status: 400 }
          );
        }
      } catch (dbError: any) {
        console.error('❌ [send-code] 查询用户失败:', dbError);
        // 如果是数据库连接错误，直接抛出
        if (dbError?.code === 'P1001' || dbError?.message?.includes('connect') || dbError?.message?.includes('ECONNREFUSED')) {
          throw new Error('数据库连接失败，请确保 MySQL 服务正在运行');
        }
        throw dbError;
      }
    }

    // 生成 6 位随机数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 计算过期时间（5分钟后）
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // 开发模式：直接输出验证码到控制台，不调用真实短信接口
      console.log('📱 [开发模式] 验证码:', code);
      console.log('📱 [开发模式] 手机号:', phone);
      console.log('📱 [开发模式] 类型:', type);
      console.log('📱 [开发模式] 过期时间:', expiresAt.toLocaleString());
    } else {
      // 生产模式：调用短信接口
      // TODO: 集成阿里云/腾讯云短信服务
      // 示例代码结构：
      // try {
      //   await sendSMS({
      //     phone,
      //     code,
      //     template: 'SMS_XXXXXX', // 短信模板ID
      //   });
      // } catch (error) {
      //   console.error('短信发送失败:', error);
      //   return NextResponse.json(
      //     { error: '短信发送失败，请稍后重试' },
      //     { status: 500 }
      //   );
      // }
    }

    // 将验证码存入数据库
    await db.verificationCode.create({
      data: {
        phone,
        code,
        type,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: isDevelopment 
        ? '验证码已生成（开发模式，请查看控制台）' 
        : '验证码已发送',
      // 开发模式下返回验证码，方便测试
      ...(isDevelopment && { code, expiresAt: expiresAt.toISOString() }),
    });

  } catch (error: any) {
    console.error('❌ [send-code] 错误详情:', error);
    
    // 处理数据库错误
    if (error instanceof Error) {
      console.error('❌ [send-code] 错误消息:', error.message);
      console.error('❌ [send-code] 错误代码:', (error as any).code);
      
      // 如果是数据库连接错误（P1001）
      if (error.message.includes('数据库连接失败') || 
          error.message.includes('Can\'t reach database') ||
          error.message.includes('ECONNREFUSED') || 
          (error as any).code === 'P1001') {
        return NextResponse.json(
          { 
            error: '数据库连接失败。请确保 MySQL 服务正在运行，并检查 DATABASE_URL 配置是否正确。\n提示：可以运行 "npx prisma migrate status" 检查数据库连接。'
          },
          { status: 503 }
        );
      }
      
      // 如果是唯一约束冲突（同一手机号短时间内重复请求）
      if (error.message.includes('Unique constraint') || 
          error.message.includes('Duplicate entry') ||
          (error as any).code === 'P2002') {
        return NextResponse.json(
          { error: '验证码发送过于频繁，请60秒后再试' },
          { status: 429 }
        );
      }
      
      // 如果是表不存在错误（P2021）
      if (error.message.includes('does not exist') || 
          error.message.includes('Table') ||
          (error as any).code === 'P2021') {
        return NextResponse.json(
          { error: '数据库表不存在。请运行 "npx prisma migrate dev" 创建数据库表。' },
          { status: 500 }
        );
      }
      
      // 如果是 Prisma Client 未生成错误
      if (error.message.includes('PrismaClient') || error.message.includes('not generated')) {
        return NextResponse.json(
          { error: 'Prisma Client 未生成。请运行 "npx prisma generate"。' },
          { status: 500 }
        );
      }
    }

    // 返回通用错误信息
    const errorMessage = error instanceof Error 
      ? error.message 
      : '未知错误';
    
    return NextResponse.json(
      { 
        error: `服务器错误: ${errorMessage}。\n请查看服务器控制台获取详细错误信息。如问题持续，请联系管理员。`
      },
      { status: 500 }
    );
  }
}

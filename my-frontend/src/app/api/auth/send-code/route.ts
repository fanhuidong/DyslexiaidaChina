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
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证类型
    const validTypes = ['REGISTER', 'LOGIN', 'RESET_PWD'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '验证码类型不正确' },
        { status: 400 }
      );
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
    });

  } catch (error) {
    console.error('❌ [send-code] 错误:', error);
    
    // 处理数据库错误
    if (error instanceof Error) {
      // 如果是唯一约束冲突（同一手机号短时间内重复请求）
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '验证码发送过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

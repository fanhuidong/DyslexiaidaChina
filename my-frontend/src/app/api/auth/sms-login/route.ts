import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/sms-login
 * 手机登录（验证验证码，返回用户信息）
 * 前端需要调用 signIn 来创建 session
 * 
 * 请求体:
 * {
 *   "phone": "13800138000",
 *   "code": "123456"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    // 验证必填字段
    if (!phone || !code) {
      return NextResponse.json(
        { error: '请提供手机号和验证码' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证验证码格式
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: '验证码格式不正确' },
        { status: 400 }
      );
    }

    // 验证验证码
    const verificationCode = await db.verificationCode.findFirst({
      where: {
        phone,
        type: 'login',
        code,
        expiresAt: {
          gte: new Date(), // 未过期
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在，请先注册' },
        { status: 404 }
      );
    }

    // 验证成功后删除验证码（一次性使用）
    await db.verificationCode.delete({
      where: {
        id: verificationCode.id,
      },
    });

    // 返回用户信息，前端需要调用 signIn 来创建 session
    return NextResponse.json(
      {
        success: true,
        message: '验证码验证成功',
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [sms-login] 短信登录错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

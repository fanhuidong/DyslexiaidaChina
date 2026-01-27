import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationCode, generateVerificationCode } from '@/lib/sms';

/**
 * POST /api/auth/send-code
 * 发送短信验证码
 * 
 * 请求体:
 * {
 *   "phone": "13800138000",
 *   "type": "register" | "login" | "reset-password" | "change-password"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type } = body;

    // 验证必填字段
    if (!phone || !type) {
      return NextResponse.json(
        { error: '请提供手机号和验证码类型' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确（请输入11位手机号）' },
        { status: 400 }
      );
    }

    // 验证类型
    const validTypes = ['register', 'login', 'reset-password', 'change-password'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '验证码类型不正确' },
        { status: 400 }
      );
    }

    // 根据类型检查用户是否存在
    if (type === 'register') {
      // 注册：检查手机号是否已存在
      const existingUser = await db.user.findUnique({
        where: { phone },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: '该手机号已被注册' },
          { status: 400 }
        );
      }
    } else if (type === 'reset-password' || type === 'change-password') {
      // 重置/修改密码：检查用户是否存在
      const user = await db.user.findUnique({
        where: { phone },
      });
      if (!user) {
        return NextResponse.json(
          { error: '该手机号未注册' },
          { status: 400 }
        );
      }
    }

    // 检查是否在1分钟内发送过验证码（防止频繁发送）
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentCode = await db.verificationCode.findFirst({
      where: {
        phone,
        type,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentCode) {
      return NextResponse.json(
        { error: '验证码发送过于频繁，请1分钟后再试' },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();

    // 添加日志（开发环境）
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDev) {
      console.log(`\n🔔 [API] 准备发送验证码 - 手机号：${phone}，类型：${type}`);
    }

    // 发送短信
    const smsResult = await sendVerificationCode(phone, code, type as any);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.message || '验证码发送失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 保存验证码到数据库（5分钟有效期）
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // 删除该手机号和类型的旧验证码
    await db.verificationCode.deleteMany({
      where: {
        phone,
        type,
      },
    });

    // 创建新验证码
    await db.verificationCode.create({
      data: {
        phone,
        code,
        type,
        expiresAt,
      },
    });

    // 开发环境返回验证码（使用之前定义的 isDev 变量）
    const responseData: any = {
      success: true,
      message: '验证码发送成功',
    };
    
    if (isDev) {
      responseData.code = code;
      console.log(`✅ [API] 验证码已生成并返回 - 验证码：${code}`);
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('❌ [send-code] 发送验证码错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-code
 * 验证验证码
 * 
 * 请求体:
 * {
 *   "phone": "13800138000",
 *   "code": "123456",
 *   "type": "register" | "login" | "reset-password" | "change-password"
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, type } = body;

    // 验证必填字段
    if (!phone || !code || !type) {
      return NextResponse.json(
        { error: '请提供手机号、验证码和类型' },
        { status: 400 }
      );
    }

    // 查找验证码
    const verificationCode = await db.verificationCode.findFirst({
      where: {
        phone,
        type,
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

    // 验证成功后删除验证码（一次性使用）
    await db.verificationCode.delete({
      where: {
        id: verificationCode.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '验证码验证成功',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [verify-code] 验证验证码错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

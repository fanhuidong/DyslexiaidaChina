import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

/**
 * POST /api/auth/reset-password
 * 重置密码（找回密码）
 * 
 * 请求体:
 * {
 *   "phone": "13800138000",
 *   "code": "123456",
 *   "newPassword": "newpassword123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, newPassword } = body;

    // 验证必填字段
    if (!phone || !code || !newPassword) {
      return NextResponse.json(
        { error: '请提供手机号、验证码和新密码' },
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

    // 验证密码长度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 验证验证码
    const verificationCode = await db.verificationCode.findFirst({
      where: {
        phone,
        type: 'reset-password',
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
        { error: '验证码错误或已过期，请重新获取' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await db.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 验证成功后删除验证码（一次性使用）
    await db.verificationCode.delete({
      where: {
        id: verificationCode.id,
      },
    });

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      {
        success: true,
        message: '密码重置成功',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [reset-password] 重置密码错误:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

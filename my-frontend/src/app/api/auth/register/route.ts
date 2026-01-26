import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';

/**
 * POST /api/auth/register
 * 用户注册
 * 
 * 请求体:
 * {
 *   "name": "用户名",
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, verificationCode } = body;

    // 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段（手机号、密码）' },
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

    // 验证密码长度（至少6位）
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 如果提供了验证码，验证验证码
    if (verificationCode) {
      const codeRecord = await db.verificationCode.findFirst({
        where: {
          phone: phone,
          code: verificationCode,
          type: 'REGISTER',
          expiresAt: {
            gt: new Date(), // 未过期
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!codeRecord) {
        return NextResponse.json(
          { error: '验证码无效或已过期' },
          { status: 400 }
        );
      }
    }

    // 检查手机号是否已存在
    const existingUser = await db.user.findUnique({
      where: {
        phone: phone,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      );
    }

    // 使用 bcrypt 加密密码
    const hashedPassword = await hashPassword(password);

    // 生成默认昵称（手机号后4位）
    const defaultNickname = `用户${phone.slice(-4)}`;

    // 创建新用户
    const user = await db.user.create({
      data: {
        phone: phone.trim(),
        password: hashedPassword,
        nickname: defaultNickname,
        role: 'USER', // 默认角色
      },
      // 不返回密码字段
      select: {
        id: true,
        phone: true,
        nickname: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          role: user.role,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ [register] 注册错误:', error);

    // 处理数据库唯一约束错误
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint') || error.message.includes('Unique')) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

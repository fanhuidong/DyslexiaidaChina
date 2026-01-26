import bcrypt from 'bcryptjs';

/**
 * 密码加密工具函数
 */

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // bcrypt 加密轮数，推荐 10-12
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 用户输入的明文密码
 * @param hashedPassword 数据库中存储的哈希密码
 * @returns 密码是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

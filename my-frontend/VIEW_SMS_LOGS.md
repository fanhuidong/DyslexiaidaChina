# 查看短信验证码日志指南

## 重要说明

现在代码已经改进，**无论是否配置短信宝，都会在服务器日志中输出验证码**，方便调试。

## 查看日志的位置

### Vercel 平台

1. **登录 Vercel 控制台**
   - 访问 https://vercel.com
   - 登录你的账号

2. **进入项目**
   - 选择你的项目

3. **查看部署日志**
   - 点击 **Deployments** 标签
   - 选择最新的部署记录
   - 点击 **Functions** 标签
   - 找到 `/api/auth/send-code` 函数
   - 点击查看 **Logs** 标签

4. **实时查看日志**
   - 在 **Functions** 页面，可以实时查看函数执行日志
   - 或者使用 Vercel CLI：`vercel logs`

### 其他平台

根据你使用的部署平台，查看相应的函数日志或服务器日志。

## 日志格式

现在日志会以以下格式输出：

```
========================================
🔔 [API] 准备发送验证码
========================================
手机号：13800138000
验证码：123456
类型：register
环境：production
短信宝配置：已配置/未配置
========================================

========================================
📤 [API] 短信发送结果
========================================
手机号：13800138000
验证码：123456
类型：register
发送成功：true/false
消息：验证码发送成功/错误信息
========================================
```

## 常见场景

### 场景 1：未配置短信宝

如果看到以下日志：
```
❌ [SMS] 短信宝配置缺失
环境变量 SMS_BAO_USERNAME 或 SMS_BAO_PASSWORD 未配置
验证码：123456（仅用于调试，用户无法收到）
```

**解决方案：**
1. 在 Vercel 环境变量中添加 `SMS_BAO_USERNAME` 和 `SMS_BAO_PASSWORD`
2. 重新部署应用

### 场景 2：短信发送失败

如果看到以下日志：
```
❌ [SMS] 短信发送失败
错误码：-2
错误信息：接口密钥不正确
验证码：123456（用于调试）
```

**解决方案：**
1. 检查 `SMS_BAO_PASSWORD` 是否使用 MD5 加密
2. 检查账号密码是否正确
3. 检查短信宝账户是否有余额

### 场景 3：发送成功但用户收不到

如果日志显示发送成功，但用户收不到短信：
1. 检查手机号格式是否正确
2. 检查短信宝账户余额
3. 检查短信宝后台是否有发送记录
4. 检查手机是否拦截了短信

## 调试技巧

### 1. 通过数据库查询验证码

即使发送失败，验证码也会保存到数据库（用于调试）。可以通过以下方式查询：

```sql
SELECT * FROM VerificationCode 
WHERE phone = '13800138000' 
ORDER BY createdAt DESC 
LIMIT 1;
```

### 2. 使用 Vercel CLI 实时查看日志

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 查看实时日志
vercel logs --follow
```

### 3. 添加临时调试端点

如果需要，可以创建一个临时调试端点来查看最近的验证码：

```typescript
// app/api/debug/verification-codes/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // 仅开发环境可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const codes = await db.verificationCode.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json(codes);
}
```

## 验证码格式

- **长度**：6位数字
- **有效期**：5分钟
- **使用次数**：一次性使用（验证后删除）

## 注意事项

1. **生产环境日志包含验证码**：这是为了便于调试，但要注意日志安全
2. **验证码会保存到数据库**：即使发送失败，也会保存（用于调试）
3. **定期清理**：建议定期清理过期的验证码记录

## 相关文档

- 生产环境配置：`PRODUCTION_SMS_SETUP.md`
- Vercel 配置：`VERCEL_SMS_CONFIG.md`
- 短信宝使用：`SMS_BAO_SETUP.md`

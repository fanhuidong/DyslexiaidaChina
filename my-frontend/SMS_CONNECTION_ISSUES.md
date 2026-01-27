# 短信发送连接问题排查指南

## 问题现象

从日志可以看到连接超时错误：
```
Connect Timeout Error (attempted address: api.smsbao.com:80, timeout: 10000ms)
```

## 可能的原因

### 1. Vercel 网络限制
Vercel 的服务器可能无法访问某些外部 API，特别是：
- 某些地区的服务器可能被限制
- HTTP (非 HTTPS) 连接可能被阻止
- 某些端口可能被限制

### 2. 短信宝服务器问题
- 短信宝的 API 服务器可能在某些地区无法访问
- 服务器可能暂时不可用

### 3. 超时时间过短
- 默认超时时间可能不够

## 已实施的改进

代码已经改进，包括：
1. ✅ **增加超时时间**：从 10 秒增加到 30 秒
2. ✅ **重试机制**：最多重试 3 次
3. ✅ **指数退避**：重试间隔逐渐增加（1秒、2秒、4秒）
4. ✅ **详细日志**：记录每次重试的详细信息

## 解决方案

### 方案 1：使用 HTTPS（推荐）

修改环境变量，使用 HTTPS：

```env
SMS_BAO_API_URL=https://api.smsbao.com/sms
```

**注意**：需要确认短信宝是否支持 HTTPS。如果不支持，此方案不可行。

### 方案 2：使用代理服务

如果 Vercel 无法直接访问短信宝 API，可以考虑：

1. **使用第三方代理服务**
2. **自建代理服务器**
3. **使用 Vercel Edge Functions**（可能可以绕过某些限制）

### 方案 3：更换短信服务商

如果短信宝在 Vercel 上无法稳定使用，可以考虑：

1. **阿里云短信服务**
2. **腾讯云短信服务**
3. **其他支持 HTTPS 的短信服务商**

### 方案 4：使用 Vercel Edge Functions

Edge Functions 运行在边缘节点，可能可以绕过某些网络限制：

```typescript
// app/api/auth/send-code/route.ts
export const runtime = 'edge'; // 使用 Edge Runtime
```

**注意**：Edge Functions 有一些限制，需要确认是否支持所有需要的功能。

### 方案 5：临时解决方案（仅用于调试）

如果暂时无法解决连接问题，可以：

1. **查看日志中的验证码**（已实现）
2. **通过数据库查询验证码**（已实现）
3. **手动发送验证码给用户**（临时方案）

## 测试步骤

### 1. 检查网络连接

在 Vercel 函数中测试连接：

```typescript
// 临时测试端点
export async function GET() {
  try {
    const response = await fetch('http://api.smsbao.com/sms?u=test&p=test&m=13800138000&c=test');
    const text = await response.text();
    return Response.json({ success: true, result: text });
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error.message,
      cause: error.cause 
    });
  }
}
```

### 2. 检查 DNS 解析

```typescript
// 测试 DNS 解析
const dns = require('dns');
dns.lookup('api.smsbao.com', (err, address) => {
  console.log('DNS 解析结果:', address, err);
});
```

### 3. 检查防火墙/网络策略

- 检查 Vercel 的网络策略
- 检查是否有 IP 白名单限制
- 检查是否有地区限制

## 当前状态

从日志可以看到：
- ✅ 验证码已生成：839856
- ✅ 验证码已保存到数据库
- ❌ 短信发送失败：连接超时

**用户可以通过以下方式获取验证码：**
1. 查看服务器日志（已输出）
2. 查询数据库（已保存）

## 建议

1. **短期**：使用日志中的验证码进行测试
2. **中期**：尝试使用 HTTPS 或更换短信服务商
3. **长期**：考虑使用更可靠的短信服务商

## 相关文档

- 查看日志：`VIEW_SMS_LOGS.md`
- 生产环境配置：`PRODUCTION_SMS_SETUP.md`
- Vercel 配置：`VERCEL_SMS_CONFIG.md`

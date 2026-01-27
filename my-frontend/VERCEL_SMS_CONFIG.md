# Vercel 部署短信宝配置快速指南

## 快速配置步骤

### 1. 登录 Vercel 控制台
访问 https://vercel.com 并登录

### 2. 选择项目
进入你的项目页面

### 3. 配置环境变量
1. 点击 **Settings** 标签
2. 点击左侧菜单的 **Environment Variables**
3. 添加以下三个环境变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SMS_BAO_USERNAME` | 你的短信宝用户名 | 在短信宝官网注册后获取 |
| `SMS_BAO_PASSWORD` | MD5加密后的密码 | 见下方"获取MD5密码" |
| `SMS_BAO_API_URL` | `http://api.smsbao.com/sms` | 可选，默认值 |

### 4. 获取 MD5 加密密码

**方法 1：使用 Node.js（推荐）**
```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('md5').update('你的原始密码').digest('hex'));"
```

**方法 2：使用在线工具**
- 访问：https://md5jiami.bmcx.com/
- 输入你的短信宝密码
- 复制 MD5 值

### 5. 设置环境变量作用域

确保环境变量在以下环境都可用：
- ✅ Production（生产环境）
- ✅ Preview（预览环境）
- ✅ Development（开发环境，可选）

### 6. 重新部署

配置完成后：
1. 点击 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**

或者直接推送代码触发自动部署。

## 验证配置

部署完成后，测试步骤：

1. 访问你的网站注册页面
2. 输入手机号
3. 点击"发送验证码"
4. 检查手机是否收到短信

如果未收到，检查 Vercel 函数日志：
1. 进入 **Deployments** 标签
2. 选择最新的部署
3. 点击 **Functions** 标签
4. 查看 `/api/auth/send-code` 函数的日志

## 常见问题

### Q: 配置后仍然收不到验证码？

**检查清单：**
- [ ] 环境变量名称是否正确（区分大小写）
- [ ] 密码是否使用 MD5 加密
- [ ] 环境变量是否应用到 Production 环境
- [ ] 是否重新部署了应用
- [ ] 短信宝账户是否有余额
- [ ] 查看函数日志是否有错误

### Q: 如何查看函数日志？

1. Vercel 控制台 → 你的项目
2. Deployments → 选择最新部署
3. Functions → 找到 `/api/auth/send-code`
4. 查看 Logs 标签

### Q: 看到 "短信服务未配置" 错误？

说明环境变量未正确配置：
1. 检查环境变量是否添加
2. 检查变量名是否正确（`SMS_BAO_USERNAME` 和 `SMS_BAO_PASSWORD`）
3. 检查是否选择了正确的环境（Production）
4. 重新部署应用

### Q: 看到 "MD5接口密钥加密不正确" 错误？

说明密码 MD5 加密有问题：
1. 确认使用的是 MD5 加密后的密码，不是原始密码
2. 重新生成 MD5 值
3. 更新环境变量
4. 重新部署

## 环境变量示例

```
SMS_BAO_USERNAME=myusername
SMS_BAO_PASSWORD=5d41402abc4b2a76b9719d911017c592
SMS_BAO_API_URL=http://api.smsbao.com/sms
```

**注意：** 上面的密码是示例，请使用你自己的 MD5 加密密码。

## 安全提示

1. ✅ 使用环境变量存储敏感信息
2. ✅ 不要将密码提交到代码仓库
3. ✅ 定期检查短信宝账户余额
4. ✅ 监控短信发送失败率

## 相关文档

- 详细配置说明：`PRODUCTION_SMS_SETUP.md`
- 短信宝使用说明：`SMS_BAO_SETUP.md`

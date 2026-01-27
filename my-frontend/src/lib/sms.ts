/**
 * 短信宝服务集成
 * 用于发送短信验证码
 * 
 * 环境变量配置：
 * SMS_BAO_USERNAME - 短信宝用户名
 * SMS_BAO_PASSWORD - 短信宝密码（MD5加密后的密码）
 * SMS_BAO_API_URL - 短信宝API地址（默认：http://api.smsbao.com/sms）
 */

interface SendSMSResult {
  success: boolean;
  message: string;
  code?: string;
}

/**
 * 发送短信验证码
 * @param phone 手机号
 * @param code 验证码
 * @param type 验证码类型（register, login, reset-password, change-password）
 * @returns 发送结果
 */
export async function sendVerificationCode(
  phone: string,
  code: string,
  type: 'register' | 'login' | 'reset-password' | 'change-password'
): Promise<SendSMSResult> {
  const username = process.env.SMS_BAO_USERNAME;
  const password = process.env.SMS_BAO_PASSWORD; // 应该是MD5加密后的密码
  const apiUrl = process.env.SMS_BAO_API_URL || 'http://api.smsbao.com/sms';

  // 检查配置
  if (!username || !password) {
    console.error('❌ [SMS] 短信宝配置缺失：SMS_BAO_USERNAME 或 SMS_BAO_PASSWORD');
    
    // 开发环境：输出验证码到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 [开发模式] 验证码：${code}，手机号：${phone}，类型：${type}`);
      return {
        success: true,
        message: '验证码已发送（开发模式）',
        code: code,
      };
    }
    
    return {
      success: false,
      message: '短信服务未配置',
    };
  }

  // 根据类型生成短信内容
  const contentMap = {
    register: `【阅读障碍】您的注册验证码是${code}，5分钟内有效。`,
    login: `【阅读障碍】您的登录验证码是${code}，5分钟内有效。`,
    'reset-password': `【阅读障碍】您的密码重置验证码是${code}，5分钟内有效。`,
    'change-password': `【阅读障碍】您的修改密码验证码是${code}，5分钟内有效。`,
  };

  const content = contentMap[type] || `【阅读障碍】您的验证码是${code}，5分钟内有效。`;

  try {
    // 短信宝API调用
    // 格式：http://api.smsbao.com/sms?u=用户名&p=MD5密码&m=手机号&c=短信内容
    const encodedContent = encodeURIComponent(content);
    const url = `${apiUrl}?u=${username}&p=${password}&m=${phone}&c=${encodedContent}`;

    const response = await fetch(url);
    const result = await response.text();

    // 短信宝返回码说明：
    // 0 - 发送成功
    // -1 - 账号不存在
    // -2 - 接口密钥不正确
    // -21 - MD5接口密钥加密不正确
    // -3 - 短信数量不足
    // -11 - 该用户被禁用
    // -14 - 短信内容出现非法字符
    // -41 - 手机号码为空
    // -42 - 手机号码格式不正确
    // -51 - 短信签名格式不正确
    // -6 - IP限制

    if (result === '0') {
      return {
        success: true,
        message: '验证码发送成功',
        code: code,
      };
    } else {
      const errorMessages: Record<string, string> = {
        '-1': '账号不存在',
        '-2': '接口密钥不正确',
        '-21': 'MD5接口密钥加密不正确',
        '-3': '短信数量不足',
        '-11': '该用户被禁用',
        '-14': '短信内容出现非法字符',
        '-41': '手机号码为空',
        '-42': '手机号码格式不正确',
        '-51': '短信签名格式不正确',
        '-6': 'IP限制',
      };

      const errorMessage = errorMessages[result] || `发送失败，错误码：${result}`;
      console.error(`❌ [SMS] 短信发送失败：${errorMessage} (${result})`);
      
      // 开发环境：即使失败也返回成功（方便测试）
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 [开发模式] 验证码：${code}，手机号：${phone}，类型：${type}`);
        return {
          success: true,
          message: '验证码已发送（开发模式）',
          code: code,
        };
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  } catch (error) {
    console.error('❌ [SMS] 短信发送异常:', error);
    
    // 开发环境：即使异常也返回成功（方便测试）
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 [开发模式] 验证码：${code}，手机号：${phone}，类型：${type}`);
      return {
        success: true,
        message: '验证码已发送（开发模式）',
        code: code,
      };
    }

    return {
      success: false,
      message: '短信发送失败，请稍后重试',
    };
  }
}

/**
 * 生成6位数字验证码
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

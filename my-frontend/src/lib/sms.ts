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
  // 默认使用 HTTP，如果支持 HTTPS 可以在环境变量中配置
  const apiUrl = process.env.SMS_BAO_API_URL || 'http://api.smsbao.com/sms';
  
  // 记录使用的 API URL（不包含敏感信息）
  const safeUrl = apiUrl.replace(/[up]=[^&]*/g, '[已隐藏]');
  console.log(`📡 [SMS] 使用 API URL: ${safeUrl}`);

  // 检查配置
  if (!username || !password) {
    // 开发环境：输出验证码到控制台（更明显的输出）
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDev) {
      console.log('\n========================================');
      console.log('📱 [开发模式] 短信验证码');
      console.log('========================================');
      console.log(`手机号：${phone}`);
      console.log(`验证码：${code}`);
      console.log(`类型：${type}`);
      console.log('========================================\n');
      return {
        success: true,
        message: '验证码已发送（开发模式）',
        code: code,
      };
    }
    
    // 生产环境：即使未配置也输出到日志（用于调试）
    // 但返回错误，提示需要配置短信服务
    // 使用 console.log 而不是 console.error，确保日志可见
    console.log('\n========================================');
    console.log('❌ [SMS] 短信宝配置缺失');
    console.log('========================================');
    console.log('环境变量 SMS_BAO_USERNAME 或 SMS_BAO_PASSWORD 未配置');
    console.log(`手机号：${phone}`);
    console.log(`验证码：${code}（仅用于调试，用户无法收到）`);
    console.log(`类型：${type}`);
    console.log(`环境：${process.env.NODE_ENV || '未设置'}`);
    console.log('========================================');
    console.log('请参考 PRODUCTION_SMS_SETUP.md 配置短信服务\n');
    
    return {
      success: false,
      message: '短信服务未配置，请联系管理员',
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

    // 使用 AbortController 设置超时（30秒）
    let response: Response | null = null;
    let result: string = '';
    const maxRetries = 3; // 最多重试3次

    // 重试机制
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      try {
        console.log(`📡 [SMS] 尝试发送短信 (第 ${attempt}/${maxRetries} 次) - URL: ${apiUrl}`);
        
        response = await fetch(url, {
          signal: controller.signal,
          // 增加超时和重试相关配置
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });
        
        clearTimeout(timeoutId);
        if (response) {
          result = await response.text();
          break; // 成功，退出重试循环
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待后重试（指数退避）
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⚠️ [SMS] 发送失败，${waitTime}ms 后重试... (错误: ${error.message})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // 如果所有重试都失败，result 可能为空
    if (!result && response) {
      try {
        result = await response.text();
      } catch (e) {
        // 如果读取响应失败，使用空字符串
        result = '';
      }
    }

    // 如果仍然没有结果，说明所有重试都失败了
    if (!result) {
      throw new Error('所有重试都失败，无法获取响应');
    }

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
      
      // 所有环境都输出详细日志（包括验证码，用于调试）
      console.log('\n========================================');
      console.log('❌ [SMS] 短信发送失败');
      console.log('========================================');
      console.log(`手机号：${phone}`);
      console.log(`验证码：${code}（用于调试）`);
      console.log(`类型：${type}`);
      console.log(`错误码：${result}`);
      console.log(`错误信息：${errorMessage}`);
      console.log(`环境：${process.env.NODE_ENV || '未设置'}`);
      console.log('========================================\n');
      
      // 开发环境：即使失败也返回成功（方便测试）
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      if (isDev) {
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
    // 所有环境都输出详细日志（包括验证码，用于调试）
    console.log('\n========================================');
    console.log('❌ [SMS] 短信发送异常');
    console.log('========================================');
    console.log(`手机号：${phone}`);
    console.log(`验证码：${code}（用于调试）`);
    console.log(`类型：${type}`);
    console.log(`环境：${process.env.NODE_ENV || '未设置'}`);
    console.log(`错误：`, error);
    console.log('========================================\n');
    
    // 开发环境：即使异常也返回成功（方便测试）
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDev) {
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

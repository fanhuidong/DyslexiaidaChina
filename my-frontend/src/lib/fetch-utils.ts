/**
 * 安全的 JSON 解析辅助函数
 */

/**
 * 安全地解析 fetch 响应为 JSON
 * @param response Fetch Response 对象
 * @returns 解析后的 JSON 数据，如果失败返回 null
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  try {
    // 检查 Content-Type
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // 检查响应状态
    if (!response.ok) {
      const statusText = response.statusText || 'Unknown Error';
      
      // 对于特定状态码提供更详细的错误信息
      // 429 (Too Many Requests) 是预期的业务逻辑错误，不打印为错误日志
      if (response.status === 405) {
        console.error(`方法不允许 (405): ${response.url}`);
        console.error(`提示: 该 API 端点可能不支持此 HTTP 方法`);
      } else if (response.status === 429) {
        // 429 是频率限制，这是预期的业务逻辑，只打印警告而不是错误
        console.warn(`频率限制 (429): ${response.url} - 这是预期的业务限制`);
      } else {
        console.error(`响应错误: ${response.status} ${statusText} | URL: ${response.url}`);
      }
      
      // 即使响应不ok，如果Content-Type是JSON，也尝试解析（某些API会在错误响应中返回JSON）
      if (isJson) {
        try {
          const data = await response.json();
          return data;
        } catch (e) {
          // JSON解析失败，返回null
          return null;
        }
      }
      
      return null;
    }

    // 响应ok，检查是否是JSON
    if (!isJson) {
      // 尝试读取文本以获取更多信息
      try {
        const text = await response.text();
        if (text && text.length < 200) {
          console.error(`响应不是 JSON 格式: ${contentType}`);
          console.error(`响应内容: ${text}`);
        }
      } catch (e) {
        // 忽略文本读取错误
      }
      return null;
    }

    // 解析 JSON
    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error?.message?.includes('JSON') || error?.message?.includes('Unexpected token')) {
      console.error('JSON 解析失败:', error.message);
      // 尝试读取原始文本
      try {
        const text = await response.clone().text();
        if (text && text.length < 200) {
          console.error('原始响应:', text);
        }
      } catch (e) {
        // 忽略
      }
    } else {
      console.error('解析响应失败:', error);
    }
    return null;
  }
}

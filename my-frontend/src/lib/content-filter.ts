/**
 * 内容过滤工具
 * 用于过滤不当言论和敏感词
 */

// 敏感词列表（可以根据需要扩展）
const SENSITIVE_WORDS = [
  '垃圾',
  '傻逼',
  '白痴',
  '蠢货',
  '滚',
  '去死',
  // 可以添加更多敏感词
];

// 检查内容是否包含敏感词
export function containsSensitiveWords(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return SENSITIVE_WORDS.some(word => lowerContent.includes(word.toLowerCase()));
}

// 过滤敏感词（用*替换）
export function filterSensitiveWords(content: string): string {
  let filtered = content;
  SENSITIVE_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

// 最大内容长度
const MAX_CONTENT_LENGTH = 5000;

// 验证内容是否合适（不包含敏感词且长度合理）
export function validateContent(content: string): { valid: boolean; message?: string; filteredContent?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, message: '内容不能为空' };
  }
  
  if (content.trim().length < 2) {
    return { valid: false, message: '内容太短，至少需要2个字符' };
  }
  
  // 如果内容太长，自动截断而不是报错
  let filteredContent = content.trim();
  if (filteredContent.length > MAX_CONTENT_LENGTH) {
    filteredContent = filteredContent.substring(0, MAX_CONTENT_LENGTH);
    console.log(`内容过长，已自动截断至 ${MAX_CONTENT_LENGTH} 个字符`);
  }
  
  if (containsSensitiveWords(filteredContent)) {
    return { valid: false, message: '内容包含不当言论，请修改后重试' };
  }
  
  return { valid: true, filteredContent };
}

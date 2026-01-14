import qs from "qs";

// 1. 硬编码您的香港服务器 IP 
// 这样在 Vercel 构建时绝对不会因为环境变量读不到而报错 (undefined)
const REMOTE_API_URL = "http://43.135.124.98:1337";

export function getStrapiURL(path = "") {
  // 2. 智能环境判断 (核心逻辑！)
  
  // 情况 A: 在服务器端运行 (Vercel 构建时，或 SSR 直播模式时)
  // 👉 直接连香港 IP，速度最快，而且服务器对服务器没有 HTTPS 限制
  if (typeof window === "undefined") {
    return `${REMOTE_API_URL}${path}`;
  }

  // 情况 B: 在客户端运行 (用户的手机/电脑浏览器)
  // 👉 返回空字符串 + 路径 (例如 /api/about)，变成相对路径
  // 这样请求会自动走 next.config.mjs 里配置的代理，从而解决 Mixed Content (HTTPS) 问题
  return path;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }
  // 图片也走上面的智能逻辑：服务器端拿绝对路径，客户端拿相对路径(走代理)
  return getStrapiURL(url);
}

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    // 合并查询参数
    const queryString = qs.stringify(urlParamsObject);
    
    // 获取请求地址 (会自动根据环境变身)
    const requestUrl = getStrapiURL(
      `/api${path}${queryString ? `?${queryString}` : ""}`
    );

    // 打印一下日志，方便去 Vercel 后台看它到底用的哪个地址
    console.log(`📡 [FetchAPI] 请求地址: ${requestUrl}`);

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // 展开选项
      ...options,
      // 强制不缓存 (直播模式)
      cache: "no-store", 
      next: { revalidate: 0 }, 
    });

    if (!response.ok) {
      console.error(`❌ API 错误: ${response.status} ${response.statusText} | URL: ${requestUrl}`);
      return null;
    }

    const data = await response.json();
    return data.data;

  } catch (error) {
    console.error("❌ 网络连接失败:", error);
    return null;
  }
}
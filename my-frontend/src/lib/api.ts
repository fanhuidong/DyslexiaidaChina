import qs from "qs";
import { API_URL, isDevelopment } from "@/config/env";

export function getStrapiURL(path = "") {
  // 2. 智能环境判断 (核心逻辑！)
  
  // 情况 A: 在服务器端运行 (SSR 或构建时)
  // 开发环境：直接连本地后端
  // 生产环境：连远程服务器
  if (typeof window === "undefined") {
    return `${API_URL}${path}`;
  }

  // 情况 B: 在客户端运行 (用户的手机/电脑浏览器)
  // 开发环境：直接连本地后端
  // 生产环境：返回相对路径，走 next.config.ts 里配置的代理
  if (isDevelopment) {
    return `${API_URL}${path}`;
  }
  // 生产环境客户端：返回相对路径，走代理
  return path;
}

export function getStrapiMedia(url: string | null | undefined) {
  // 处理各种空值情况
  if (url == null || url === "" || url === undefined) {
    if (isDevelopment) {
      console.warn(`⚠️ [getStrapiMedia] 图片 URL 为空:`, url);
    }
    return null;
  }
  
  // 如果已经是完整 URL（http/https），需要特殊处理
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // 在生产环境下，无论服务器端还是客户端，都转换为相对路径走代理
    // 这样可以避免 Mixed Content 问题（HTTPS 页面加载 HTTP 资源）
    if (!isDevelopment) {
      try {
        const urlObj = new URL(url);
        // 如果是后端服务器的 URL（HTTP），提取路径部分走代理
        // 这样可以避免 Mixed Content 错误
        if (urlObj.protocol === "http:" && 
            (urlObj.hostname === "43.135.124.98" || 
             urlObj.hostname === "localhost" || 
             urlObj.hostname.includes("43.135.124.98"))) {
          const relativePath = urlObj.pathname + urlObj.search;
          console.log(`🖼️ [getStrapiMedia] 生产环境转换 HTTP: ${url} -> ${relativePath}`);
          return relativePath;
        }
        // 如果是 HTTPS URL，直接返回（不需要转换）
        if (urlObj.protocol === "https:") {
          console.log(`🖼️ [getStrapiMedia] HTTPS URL: ${url}`);
          return url;
        }
      } catch (e) {
        console.error(`❌ [getStrapiMedia] URL 解析失败: ${url}`, e);
        // URL 解析失败，继续使用原逻辑
      }
    }
    
    // 开发环境直接返回完整 URL
    if (isDevelopment) {
      console.log(`🖼️ [getStrapiMedia] 完整URL: ${url}`);
    }
    return url;
  }
  
  // 如果是以 // 开头，补充协议
  if (url.startsWith("//")) {
    // 在生产环境下，转换为相对路径走代理
    if (!isDevelopment) {
      // 提取路径部分
      const pathMatch = url.match(/\/\/[^\/]+(\/.*)/);
      if (pathMatch) {
        console.log(`🖼️ [getStrapiMedia] 生产环境转换协议相对: ${url} -> ${pathMatch[1]}`);
        return pathMatch[1];
      }
    }
    
    // 开发环境补充协议
    const protocol = isDevelopment ? "http" : "https";
    const finalUrl = `${protocol}:${url}`;
    if (isDevelopment) {
      console.log(`🖼️ [getStrapiMedia] 协议相对URL: ${url} -> ${finalUrl}`);
    }
    return finalUrl;
  }
  
  // 确保相对路径以 / 开头
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  
  // 关键修复：在生产环境下，无论服务器端还是客户端，都返回相对路径
  // 这样客户端可以通过 Next.js 代理加载图片，避免 Mixed Content 错误
  if (!isDevelopment) {
    // 生产环境：始终返回相对路径，走代理
    console.log(`🖼️ [getStrapiMedia] 生产环境相对路径: "${url}" -> "${normalizedPath}"`);
    return normalizedPath;
  }
  
  // 开发环境：使用绝对路径
  const finalUrl = getStrapiURL(normalizedPath);
  console.log(`🖼️ [getStrapiMedia] 开发环境: "${url}" -> "${normalizedPath}" -> "${finalUrl}"`);
  
  return finalUrl;
}

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    // 合并查询参数，使用 Strapi 兼容的格式
    const queryString = qs.stringify(urlParamsObject, {
      encodeValuesOnly: true, // 只编码值，不编码键
      addQueryPrefix: false, // 不自动添加 ?
    });
    
    // 处理路径中可能已存在的查询参数
    const pathWithoutQuery = path.split('?')[0];
    const existingQuery = path.includes('?') ? path.split('?')[1] : '';
    
    // 合并查询参数
    let finalQuery = '';
    if (existingQuery && queryString) {
      finalQuery = `?${existingQuery}&${queryString}`;
    } else if (existingQuery) {
      finalQuery = `?${existingQuery}`;
    } else if (queryString) {
      finalQuery = `?${queryString}`;
    }
    
    // 获取请求地址 (会自动根据环境变身)
    const requestUrl = getStrapiURL(
      `/api${pathWithoutQuery}${finalQuery}`
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
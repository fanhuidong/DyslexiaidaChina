// src/lib/api.ts

import qs from "qs";

// 强制指定 Strapi 地址 (Windows 上用 127.0.0.1 比 localhost 更稳)
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:8888";

export function getStrapiURL(path = "") {
  return `${STRAPI_URL}${path}`;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }
  return `${STRAPI_URL}${url}`;
}

export async function fetchAPI(
  path: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    // 合并查询参数
    const queryString = qs.stringify(urlParamsObject);
    const requestUrl = `${getStrapiURL(
      `/api${path}${queryString ? `?${queryString}` : ""}`
    )}`;


    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // 禁用缓存，确保拿到最新数据 (开发时很有用)
      cache: "no-store", 
      ...options,
    });

    if (!response.ok) {
      console.error(`❌ API 错误: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    // Strapi 返回结构通常是 { data: [...], meta: ... }
    // 我们直接返回 data 字段
    return data.data;

  } catch (error) {
    console.error("❌ 网络连接失败:", error);
    return null; // 失败时返回 null
  }
}
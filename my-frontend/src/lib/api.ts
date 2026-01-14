// src/lib/api.ts

import qs from "qs";

// 强制指定 Strapi 地址 (Windows 上用 127.0.0.1 比 localhost 更稳)
// const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:8888";
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ;


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
  // 👇 1. 先把外面的选项展开 (这样如果有冲突，下面的会覆盖上面的)
  ...options,

  // 👇 2. 这里的设置才是“王法” (强制覆盖)
  cache: "no-store", 
  next: { revalidate: 0 }, // 👈 双保险：告诉 Next.js 0秒更新一次
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
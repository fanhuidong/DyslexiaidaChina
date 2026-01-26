"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, Type, Eye, X, MousePointer2 } from "lucide-react";

export default function AccessibilityToolbar() {
  const [isHoverMode, setIsHoverMode] = useState(false);
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [rulerY, setRulerY] = useState(0);
  
  const currentElementRef = useRef<HTMLElement | null>(null);

  // ================= 1. 🖱️ 悬停朗读核心逻辑 =================
  useEffect(() => {
    // 移除高亮的辅助函数
    const removeHighlight = () => {
      if (currentElementRef.current) {
        currentElementRef.current.style.backgroundColor = "";
        currentElementRef.current.style.borderRadius = "";
        currentElementRef.current.style.transition = "";
        // 如果是按钮，可能还有 transform 效果，这里最好不要暴力清除 transform
        // 但为了 MVP 简单起见，我们只清除背景色
        currentElementRef.current = null;
      }
    };

    if (!isHoverMode) {
      window.speechSynthesis.cancel();
      removeHighlight();
      return;
    }

    const handleMouseOver = (e: MouseEvent) => {
      // 👇 核心修改 1：定义 CSS 选择器字符串
      // 包含：所有标题、段落、列表、链接、Span、引用... 以及 BUTTON 和 LABEL
      const selectors = 'p, h1, h2, h3, h4, h5, h6, li, a, span, blockquote, button, label';
      
      const target = e.target as HTMLElement;

      // 👇 核心修改 2：使用 closest() 智能查找
      // 比如您摸到了按钮里的图标(svg)，它会自动向上找到父级 button
      const element = target.closest(selectors) as HTMLElement;

      // 如果找到了元素，且该元素不是我们自己这个工具栏里的按钮（防止自己读自己干扰操作）
      // 并且元素里有文字内容
      if (element && !element.closest('.accessibility-toolbar') && element.innerText.trim().length > 0) {
        
        // 如果已经是在读这个元素了，就别打断
        if (currentElementRef.current === element) return;

        // 1. 停止之前的
        window.speechSynthesis.cancel();
        removeHighlight();

        // 2. 高亮当前
        element.style.backgroundColor = "rgba(255, 255, 0, 0.4)"; // 加深了一点颜色
        element.style.borderRadius = "4px";
        element.style.transition = "background-color 0.2s";
        currentElementRef.current = element;

        // 3. 朗读
        const utterance = new SpeechSynthesisUtterance(element.innerText);
        utterance.lang = "zh-CN"; 
        utterance.rate = 1.0; 
        window.speechSynthesis.speak(utterance);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      // 只有当鼠标真的离开了当前高亮的元素时才停止
      // (这里不做复杂判断了，为了反应快，移开就停)
      window.speechSynthesis.cancel();
      removeHighlight();
    };

    document.body.addEventListener("mouseover", handleMouseOver);
    document.body.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.body.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseout", handleMouseOut);
      window.speechSynthesis.cancel();
      removeHighlight();
    };
  }, [isHoverMode]);

  // ================= 2. 🔤 字体切换 =================
  const toggleFont = () => {
    const html = document.documentElement;
    if (isDyslexiaMode) {
      html.classList.remove("dyslexia-mode");
    } else {
      html.classList.add("dyslexia-mode");
    }
    setIsDyslexiaMode(!isDyslexiaMode);
  };

  // ================= 3. 📏 阅读尺 =================
  useEffect(() => {
    if (!showRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showRuler]);

  return (
    <>
      {/* 给工具栏加一个特定的 className: accessibility-toolbar，方便上面逻辑排除它 */}
      <div className="accessibility-toolbar fixed bottom-8 right-8 z-[100] flex flex-col gap-3 bg-white p-2.5 rounded-full shadow-2xl border border-gray-200 print:hidden">
        
        {/* 指读模式开关 */}
        <button 
          onClick={() => setIsHoverMode(!isHoverMode)}
          title={isHoverMode ? "关闭指读模式" : "开启鼠标指读"}
          className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
            isHoverMode 
              ? "bg-[#5c4ae3] text-white rotate-0 scale-110 ring-4 ring-purple-100" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
          }`}
        >
          {isHoverMode ? <Volume2 size={24} /> : <MousePointer2 size={24} />}
        </button>

        {/* 字体切换 */}
        <button 
          onClick={toggleFont}
          title="切换阅读障碍专用字体"
          className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
            isDyslexiaMode 
              ? "bg-[#5c4ae3] text-white scale-110" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
          }`}
        >
          <Type size={24} />
        </button>

        {/* 阅读尺 */}
        <button 
          onClick={() => setShowRuler(!showRuler)}
          title="开启阅读聚焦尺"
          className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
            showRuler 
              ? "bg-[#5c4ae3] text-white scale-110" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
          }`}
        >
          {showRuler ? <X size={24} /> : <Eye size={24} />}
        </button>
      </div>

      {/* 阅读尺遮罩层 */}
      {showRuler && (
        <div className="fixed inset-0 z-[90] pointer-events-none overflow-hidden h-screen w-screen">
          <div 
            className="absolute top-0 left-0 w-full bg-black/60 transition-none will-change-transform"
            style={{ height: Math.max(0, rulerY - 50) }} 
          />
          <div 
            className="absolute left-0 w-full h-[100px] bg-transparent transition-none will-change-transform flex items-center"
            style={{ top: Math.max(0, rulerY - 50) }}
          >
            <div className="w-full h-1 bg-yellow-400/50 blur-[1px]"></div>
          </div>
          <div 
            className="absolute left-0 w-full bottom-0 bg-black/60 transition-none will-change-transform"
            style={{ top: rulerY + 50 }}
          />
        </div>
      )}
    </>
  );
}
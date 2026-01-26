"use client";

import React, { useState } from "react";
import { CheckSquare, Square, AlertCircle } from "lucide-react";
import { BlocksContent, BlocksRenderer } from "@strapi/blocks-react-renderer";

interface Question {
  id: number;
  QuestionText: string;
}

interface AssessmentProps {
  title: string;
  questions: Question[];
  passingScore: number;
  resultTitle: string;
  resultContent: BlocksContent;
}

export default function AssessmentQuiz({ 
  title, 
  questions, 
  passingScore, 
  resultTitle, 
  resultContent 
}: AssessmentProps) {
  // 记录用户选中的题目 ID
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const score = selectedIds.length;
  const isRisk = score >= passingScore;

  return (
    <div className="mt-12 bg-surface rounded-card-large border border-gray-200 overflow-hidden shadow-card">
      {/* 标题栏 */}
      <div className="bg-secondary p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <CheckSquare className="w-8 h-8" />
          {title || "成人自我评估测试"}
        </h2>
        <p className="text-white/80 mt-2 text-sm font-medium">
          请勾选符合您情况的选项。
        </p>
      </div>

      {/* 题目列表 */}
      <div className="p-6 md:p-8 space-y-4">
        {questions.map((q) => {
          const isSelected = selectedIds.includes(q.id);
          return (
            <div 
              key={q.id}
              onClick={() => handleToggle(q.id)}
              className={`group flex items-start gap-4 p-4 rounded-card cursor-pointer transition-all duration-200 border ${
                isSelected 
                  ? "bg-primary/5 border-primary/30 shadow-sm" 
                  : "bg-surface border-gray-100 hover:border-gray-300 hover:shadow-card"
              }`}
            >
              {/* 复选框图标 */}
              <div className={`mt-0.5 shrink-0 transition-colors ${isSelected ? "text-primary" : "text-gray-300 group-hover:text-gray-400"}`}>
                {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              
              {/* 题目文字 */}
              <div className={`text-base md:text-lg font-medium select-none ${isSelected ? "text-primary" : "text-gray-700"}`}>
                {q.QuestionText}
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部操作区 */}
      <div className="p-6 md:p-8 bg-gray-100 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-gray-500 font-bold">
          已选中: <span className="text-secondary text-2xl">{score}</span> 项
        </div>
        
        {!showResult ? (
          <button 
            onClick={() => setShowResult(true)}
            className="w-full md:w-auto bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-hover hover:-translate-y-0.5 transition-all active:scale-95 shadow-md focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            查看评估结果
          </button>
        ) : (
          <button 
            onClick={() => { setShowResult(false); setSelectedIds([]); }}
            className="text-gray-500 underline text-sm hover:text-gray-800"
          >
            重置测试
          </button>
        )}
      </div>

      {/* 结果显示区 */}
      {showResult && (
        <div className={`p-8 animate-in slide-in-from-bottom-5 fade-in duration-500 ${isRisk ? "bg-purple-50" : "bg-green-50"}`}>
          <div className="flex items-start gap-4">
            <AlertCircle className={`w-8 h-8 shrink-0 ${isRisk ? "text-primary" : "text-green-600"}`} />
            <div>
              <h3 className={`text-xl font-black mb-3 ${isRisk ? "text-primary" : "text-green-800"}`}>
                {isRisk ? (resultTitle || "评估结果提示") : "评估风险较低"}
              </h3>
              
              {isRisk ? (
                <div className="prose prose-purple prose-sm md:prose-base">
                   {/* 渲染后台配置的结果富文本 */}
                   {resultContent && <BlocksRenderer content={resultContent} />}
                   <p className="mt-4 text-xs text-gray-500 border-t border-purple-200 pt-2">
                     *注：本自我评估并非专业医疗诊断。如您勾选了 {passingScore} 项以上，建议咨询专业人士。
                   </p>
                </div>
              ) : (
                <p className="text-green-700 font-medium">
                  根据您的回答，您表现出的阅读障碍特征较少。
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
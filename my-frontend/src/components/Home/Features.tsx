import React from 'react';
import Link from 'next/link';
import { MapPin, ClipboardCheck, HeartHandshake, ArrowRight } from 'lucide-react';

export default function Features() {
  const features = [
    {
      id: 1,
      title: "寻找专家",
      subTitle: "FIND A PROVIDER",
      icon: <MapPin className="w-10 h-10 mb-4" />,
      href: "/provider",
      color: "bg-primary", // 红色
      hoverColor: "hover:bg-primary-hover",
    },
    {
      id: 2,
      title: "读写障碍测试",
      subTitle: "DYSLEXIA SCREENER",
      icon: <ClipboardCheck className="w-10 h-10 mb-4" />,
      href: "/screener",
      color: "bg-secondary", // 深蓝
      hoverColor: "hover:bg-blue-900",
    },
    {
      id: 3,
      title: "支持我们",
      subTitle: "DONATE NOW",
      icon: <HeartHandshake className="w-10 h-10 mb-4" />,
      href: "/donate",
      color: "bg-[#008080]", // 特殊的青色 (IDA 风格)
      hoverColor: "hover:bg-[#006666]",
    },
  ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {features.map((feature) => (
          <Link 
            key={feature.id} 
            href={feature.href}
            className={`${feature.color} ${feature.hoverColor} text-white p-12 flex flex-col items-center justify-center text-center transition-all duration-300 group`}
          >
            {/* 图标层：悬停时轻微放大 */}
            <div className="transform transition-transform duration-300 group-hover:scale-110 opacity-90">
              {feature.icon}
            </div>

            {/* 文字层 */}
            <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
              {feature.title}
            </h3>
            <p className="text-sm font-medium opacity-80 tracking-widest uppercase mb-6">
              {feature.subTitle}
            </p>

            {/* 模拟按钮 */}
            <div className="inline-flex items-center text-sm font-bold border-2 border-white/30 px-6 py-2 rounded-full group-hover:bg-white group-hover:text-gray-900 transition-colors">
              点击进入 <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
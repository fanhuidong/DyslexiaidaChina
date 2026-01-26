import React from 'react';
import Link from 'next/link';
import { BookOpen, ClipboardCheck, Mail, ArrowRight } from 'lucide-react';

export default function Features() {
  const features = [
    {
      id: 1,
      title: "阅读障碍是什么",
      subTitle: "WHAT IS DYSLEXIA",
      icon: <BookOpen className="w-8 h-8" />,
      href: "/definition",
      gradient: "from-primary/10 via-primary/5 to-transparent",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
      hoverBorder: "group-hover:border-primary/40",
      buttonBg: "bg-primary",
      buttonHover: "group-hover:bg-primary-hover",
    },
    {
      id: 2,
      title: "读写障碍测试",
      subTitle: "DYSLEXIA SCREENER",
      icon: <ClipboardCheck className="w-8 h-8" />,
      href: "/do-i-have-dyslexia",
      gradient: "from-mint/20 via-mint/10 to-transparent",
      iconBg: "bg-mint/15",
      iconColor: "text-mint-dark",
      borderColor: "border-mint/30",
      hoverBorder: "group-hover:border-mint-dark/50",
      buttonBg: "bg-mint-dark",
      buttonHover: "group-hover:bg-mint-dark/90",
    },
    {
      id: 3,
      title: "联系我们",
      subTitle: "CONTACT US",
      icon: <Mail className="w-8 h-8" />,
      href: "/about/contact",
      gradient: "from-coral/15 via-coral/8 to-transparent",
      iconBg: "bg-coral/12",
      iconColor: "text-coral-dark",
      borderColor: "border-coral/25",
      hoverBorder: "group-hover:border-coral-dark/40",
      buttonBg: "bg-coral",
      buttonHover: "group-hover:bg-coral-dark",
    },
  ];

  return (
    <section className="w-full bg-off-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <Link 
              key={feature.id} 
              href={feature.href}
              className="group relative bg-surface rounded-card-large border-2 border-gray-100 p-8 md:p-10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* 背景渐变装饰 */}
              <div className={`absolute inset-0 rounded-card-large bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* 内容层 */}
              <div className="relative z-10 w-full flex flex-col items-center">
                {/* 图标容器 */}
                <div className={`${feature.iconBg} ${feature.iconColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  {feature.icon}
                </div>

                {/* 标题 */}
                <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2 tracking-tight">
                  {feature.title}
                </h3>
                
                {/* 副标题 */}
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-6">
                  {feature.subTitle}
                </p>

                {/* 按钮 */}
                <div className={`${feature.buttonBg} ${feature.buttonHover} text-white px-6 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition-all duration-300 group-hover:shadow-md`}>
                  了解更多
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 边框高亮效果 */}
              <div className={`absolute inset-0 rounded-card-large border-2 ${feature.borderColor} ${feature.hoverBorder} pointer-events-none transition-all duration-300`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { IconCopy, IconFileTypePdf, IconExternalLink, IconFlame, IconDeviceMobile } from "@tabler/icons-react";
import { Button } from "./button";

// Mock 数据
const mockResults = {
  en: {
    summary: "Users mainly complain about slow mobile performance and confusing navigation. The overall sentiment is Frustrated.",
    frustrationScore: 78,
    insights: [
      {
        title: "Mobile App is too slow",
        severity: "High Severity",
        category: "Performance",
        description: "Users report that the mobile app takes 10+ seconds to load, causing them to abandon tasks frequently.",
        opportunity: "Build a lightweight version with offline-first architecture to improve load times by 80%.",
        quote: "I love the features but the app is unusable on my phone. Takes forever to load anything.",
        quoteAuthor: "u/ProductHunter23",
        quoteLink: "https://reddit.com/r/saas/comments/example1"
      },
      {
        title: "Confusing navigation menu",
        severity: "Medium Severity",
        category: "UX/UI",
        description: "New users struggle to find basic features because the navigation structure is too complex and inconsistent.",
        opportunity: "Redesign the navigation with a simplified 3-tier structure and add onboarding tooltips.",
        quote: "Took me 20 minutes to figure out where the export button was. Not intuitive at all.",
        quoteAuthor: "u/DesignCritic",
        quoteLink: "https://reddit.com/r/saas/comments/example2"
      },
      {
        title: "No bulk editing feature",
        severity: "High Severity",
        category: "Feature Gap",
        description: "Power users need to edit multiple items at once but currently have to do it one by one.",
        opportunity: "Implement batch operations with multi-select functionality to save users 70% of their time.",
        quote: "I have to edit 200+ entries manually. There's no bulk edit option which is insane in 2024.",
        quoteAuthor: "u/ProductivityGuru",
        quoteLink: "https://reddit.com/r/saas/comments/example3"
      }
    ]
  },
  zh: {
    summary: "用户主要抱怨移动端性能缓慢和导航混乱。整体情绪为沮丧。",
    frustrationScore: 78,
    insights: [
      {
        title: "移动应用速度太慢",
        severity: "高严重性",
        category: "性能",
        description: "用户反馈移动应用加载时间超过 10 秒，导致他们频繁放弃任务。",
        opportunity: "构建轻量级离线优先架构版本，将加载时间提升 80%。",
        quote: "我喜欢这些功能，但应用在手机上根本无法使用。加载任何内容都需要很长时间。",
        quoteAuthor: "u/ProductHunter23",
        quoteLink: "https://reddit.com/r/saas/comments/example1"
      },
      {
        title: "导航菜单令人困惑",
        severity: "中等严重性",
        category: "用户体验/界面",
        description: "新用户很难找到基本功能，因为导航结构过于复杂且不一致。",
        opportunity: "重新设计导航，采用简化的三层结构并添加引导提示。",
        quote: "花了 20 分钟才找到导出按钮在哪里。一点也不直观。",
        quoteAuthor: "u/DesignCritic",
        quoteLink: "https://reddit.com/r/saas/comments/example2"
      },
      {
        title: "缺少批量编辑功能",
        severity: "高严重性",
        category: "功能缺口",
        description: "高级用户需要一次编辑多个项目，但目前只能逐个编辑。",
        opportunity: "实现批量操作和多选功能，为用户节省 70% 的时间。",
        quote: "我必须手动编辑 200 多个条目。2024 年了竟然没有批量编辑选项，太疯狂了。",
        quoteAuthor: "u/ProductivityGuru",
        quoteLink: "https://reddit.com/r/saas/comments/example3"
      }
    ]
  }
};

interface PainPointResultsProps {
  onClose?: () => void;
}

export const PainPointResults = ({ onClose }: PainPointResultsProps) => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  
  const data = isZh ? mockResults.zh : mockResults.en;
  
  const content = {
    summaryTitle: isZh ? "执行摘要" : "Executive Summary",
    frustrationIndex: isZh ? "愤怒指数" : "Frustration Index",
    insightsTitle: isZh ? "痛点详情" : "Pain Point Insights",
    opportunityLabel: isZh ? "💡 商机建议" : "💡 Opportunity",
    userQuoteLabel: isZh ? "用户原声" : "User Quote",
    viewOnReddit: isZh ? "在 Reddit 查看" : "View on Reddit",
    copyReport: isZh ? "复制报告" : "Copy Report",
    exportPdf: isZh ? "导出 PDF" : "Export to PDF",
    severityHigh: isZh ? "高严重性" : "High Severity",
    severityMedium: isZh ? "中等严重性" : "Medium Severity",
  };

  const getSeverityColor = (severity: string) => {
    if (severity.includes("High") || severity.includes("高")) {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
    }
    return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
  };

  const handleCopyReport = () => {
    console.log("Copy report");
    // 实现复制功能
  };

  const handleExportPdf = () => {
    console.log("Export PDF");
    // 实现导出功能
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4 pb-20 relative z-10">
      {/* A. 总结卡片 */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
              {content.summaryTitle}
            </h3>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {data.summary}
            </p>
          </div>
          
          {/* 愤怒指数仪表盘 */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 min-w-[160px]">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-neutral-200 dark:text-neutral-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.frustrationScore / 100)}`}
                  className="text-red-500 dark:text-red-400 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {data.frustrationScore}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-2 text-center">
              {content.frustrationIndex}
            </p>
          </div>
        </div>
      </div>

      {/* B. 痛点详情卡 - 3列网格 */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-6">
          {content.insightsTitle}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.insights.map((insight, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* 标题 */}
              <h4 className="text-lg font-bold text-black dark:text-white mb-3">
                {insight.title}
              </h4>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                  <IconFlame className="h-3 w-3" />
                  {insight.severity}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  <IconDeviceMobile className="h-3 w-3" />
                  {insight.category}
                </span>
              </div>
              
              {/* 问题描述 */}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                {insight.description}
              </p>
              
              {/* 商机建议 */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mb-1">
                  {content.opportunityLabel}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {insight.opportunity}
                </p>
              </div>
              
              {/* 用户原声 */}
              <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                  {content.userQuoteLabel}
                </p>
                <blockquote className="text-sm italic text-neutral-600 dark:text-neutral-400 mb-2 pl-3 border-l-2 border-neutral-300 dark:border-neutral-600">
                  "{insight.quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    — {insight.quoteAuthor}
                  </span>
                  <a
                    href={insight.quoteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                  >
                    {content.viewOnReddit}
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C. 导出/行动按钮 */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleCopyReport} variant="outline" className="px-6">
          <IconCopy className="h-5 w-5" />
          <span>{content.copyReport}</span>
        </Button>
        <Button onClick={handleExportPdf} className="px-6">
          <IconFileTypePdf className="h-5 w-5" />
          <span>{content.exportPdf}</span>
        </Button>
      </div>
    </div>
  );
};

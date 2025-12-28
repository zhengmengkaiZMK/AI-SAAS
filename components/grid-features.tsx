"use client";

import { cn } from "@/lib/utils";
import {
  IconBrain,
  IconSearch,
  IconChartBar,
  IconDeviceAnalytics,
  IconWorldWww,
  IconCurrencyDollar,
  IconFileDownload,
  IconTrendingUp,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export const GridFeatures = () => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const features = [
    {
      title: isZh ? "AI 智能分析" : "AI-Powered Analysis",
      description: isZh
        ? "先进的 AI 技术自动分析 Reddit 讨论,挖掘隐藏的用户痛点和产品机会。"
        : "Advanced AI technology automatically analyzes Reddit discussions to uncover hidden user pain points and product opportunities.",
      icon: <IconBrain />,
    },
    {
      title: isZh ? "实时搜索引擎" : "Real-Time Search",
      description: isZh
        ? "即时搜索 Reddit、X 等多个平台,获取最新鲜的用户反馈和讨论。"
        : "Instant search across Reddit, X, and multiple platforms for the freshest user feedback and discussions.",
      icon: <IconSearch />,
    },
    {
      title: isZh ? "愤怒指数评分" : "Frustration Score",
      description: isZh
        ? "独创 0-100 分愤怒指数,量化用户痛点严重程度,精准识别产品机会。"
        : "Unique 0-100 frustration scoring system to quantify pain point severity and identify product opportunities.",
      icon: <IconChartBar />,
    },
    {
      title: isZh ? "结构化洞察报告" : "Structured Insights",
      description: isZh
        ? "生成包含摘要、痛点详情和真实引用的专业分析报告,助力数据驱动决策。"
        : "Generate professional analysis reports with summaries, detailed pain points, and real user quotes for data-driven decisions.",
      icon: <IconDeviceAnalytics />,
    },
    {
      title: isZh ? "多平台覆盖" : "Multi-Platform Support",
      description: isZh
        ? "支持 Reddit、X、Product Hunt、Hacker News 等主流社区平台。"
        : "Support for major platforms including Reddit, X, Product Hunt, and Hacker News.",
      icon: <IconWorldWww />,
    },
    {
      title: isZh ? "灵活定价方案" : "Flexible Pricing",
      description: isZh
        ? "免费版每日 5 次查询,专业版无限使用。月付/年付灵活选择,年付享 8 折优惠。"
        : "Free plan with 3 daily queries, professional plan with unlimited access. Monthly or annual billing with 20% off for annual plans.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: isZh ? "导出与分享" : "Export & Share",
      description: isZh
        ? "专业版支持导出 CSV/JSON 格式报告,轻松与团队分享洞察成果。"
        : "Professional plan includes CSV/JSON export functionality to easily share insights with your team.",
      icon: <IconFileDownload />,
    },
    {
      title: isZh ? "搜索历史管理" : "Search History",
      description: isZh
        ? "自动保存所有搜索历史,随时查看过往分析,追踪痛点变化趋势。"
        : "Automatically save all search history, review past analyses anytime, and track pain point trends over time.",
      icon: <IconTrendingUp />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover:opacity-100 transition duration-200 group absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover:opacity-100 transition duration-200 group absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-blue-500 transition duration-200" />
        <span className="group-hover:translate-x-2 transition duration-200 inline-block">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted dark:text-muted-dark max-w-xs mx-auto relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

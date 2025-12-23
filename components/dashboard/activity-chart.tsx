"use client";

import { usePathname } from "next/navigation";
import { BarChart3, Search } from "lucide-react";

interface ActivityChartProps {
  totalSearches: number;
}

export function ActivityChart({ totalSearches }: ActivityChartProps) {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {isZh ? "总体使用统计" : "Overall Usage Stats"}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isZh ? "您的历史使用情况" : "Your historical usage"}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {isZh ? "总搜索次数" : "Total Searches"}
            </span>
          </div>
          <span className="text-3xl font-bold text-black dark:text-white">
            {totalSearches.toLocaleString()}
          </span>
        </div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-6 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {isZh
            ? "统计数据包含自注册以来的所有使用记录。配额每日 00:00 (UTC) 重置。"
            : "Statistics include all usage since registration. Quota resets daily at 00:00 UTC."}
        </p>
      </div>
    </div>
  );
}

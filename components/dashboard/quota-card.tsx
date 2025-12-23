"use client";

import { usePathname } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "../button";

interface QuotaCardProps {
  used: number;
  limit: number;
  date: string;
}

export function QuotaCard({ used, limit, date }: QuotaCardProps) {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isExceeded = used >= limit;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
      {/* 标题部分 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">
              {isZh ? "Reddit 搜索配额" : "Reddit Search Quota"}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isZh ? "今日搜索次数" : "Searches today"}
            </p>
          </div>
        </div>

        {isExceeded && (
          <Link href="/pricing">
            <Button size="sm" variant="simple">
              <TrendingUp className="h-4 w-4 mr-1" />
              {isZh ? "升级" : "Upgrade"}
            </Button>
          </Link>
        )}
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-black dark:text-white">
            {used} <span className="text-base font-normal text-neutral-500">/ {limit}</span>
          </span>
          <span
            className={`text-sm font-medium ${
              isExceeded
                ? "text-red-600 dark:text-red-400"
                : isNearLimit
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isExceeded
                ? "bg-red-500"
                : isNearLimit
                ? "bg-yellow-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 状态提示 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-400">
          {isExceeded
            ? isZh
              ? "已达到今日限额"
              : "Daily limit reached"
            : isNearLimit
            ? isZh
              ? "即将达到限额"
              : "Approaching limit"
            : isZh
            ? `剩余 ${limit - used} 次`
            : `${limit - used} remaining`}
        </span>
        <span className="text-neutral-400 dark:text-neutral-500 text-xs">
          {new Date(date).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
        </span>
      </div>

      {/* 升级提示 */}
      {isExceeded && (
        <div className="mt-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {isZh
              ? "升级到高级会员以解锁更多配额！"
              : "Upgrade to Premium to unlock more quota!"}
          </p>
        </div>
      )}
    </div>
  );
}

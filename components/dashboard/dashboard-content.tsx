"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserInfoCard } from "./user-info-card";
import { QuotaCard } from "./quota-card";
import { MembershipCard } from "./membership-card";
import { ActivityChart } from "./activity-chart";
import { Skeleton } from "./skeleton";

interface QuotaData {
  date: string;
  searchesUsed: number;
  searchesLimit: number;
}

interface UserStats {
  totalSearches: number;
  memberSince: string;
}

export function DashboardContent() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/user/dashboard");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch dashboard data");
        }

        setQuotaData(data.quota);
        setUserStats(data.stats);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-red-600 dark:text-red-400">
            {isZh ? "加载失败：" : "Error: "}{error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          {isZh ? "仪表板" : "Dashboard"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {isZh
            ? `欢迎回来，${session.user.name || session.user.email}`
            : `Welcome back, ${session.user.name || session.user.email}`}
        </p>
      </div>

      {/* 主要内容区域 - 优化为两列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 左侧：用户信息 */}
        <UserInfoCard
          user={{
            name: session.user.name || "User",
            email: session.user.email,
            membershipType: session.user.membershipType,
            avatar: null,
            memberSince: userStats?.memberSince || new Date().toISOString(),
          }}
        />
        
        {/* 右侧：会员状态 */}
        <MembershipCard
          membershipType={session.user.membershipType}
          expiresAt={null}
        />
      </div>

      {/* Reddit搜索配额 */}
      {quotaData && (
        <div className="mb-8">
          <QuotaCard
            used={quotaData.searchesUsed}
            limit={quotaData.searchesLimit}
            date={quotaData.date}
          />
        </div>
      )}

      {/* 使用统计 - 已隐藏 */}
      {/* {userStats && (
        <ActivityChart totalSearches={userStats.totalSearches} />
      )} */}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

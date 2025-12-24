"use client";

import { usePathname } from "next/navigation";
import { Crown, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../button";

interface MembershipCardProps {
  membershipType: string;
  expiresAt: string | null;
}

export function MembershipCard({
  membershipType,
  expiresAt,
}: MembershipCardProps) {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const isFree = membershipType === "FREE";
  const isPremium = membershipType === "PREMIUM";

  const config = {
    FREE: {
      title: isZh ? "免费版" : "Free Plan",
      description: isZh
        ? "升级到专业版以解锁更多功能"
        : "Upgrade to Professional for more features",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-600 dark:text-gray-400",
      iconColor: "text-gray-500",
    },
    PREMIUM: {
      title: isZh ? "专业版" : "Professional",
      description: isZh ? "享受无限访问和深度分析" : "Enjoy unlimited access and deep insights",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-800 dark:text-yellow-400",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  };

  const currentConfig = config[membershipType as keyof typeof config] || config.FREE;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
      {/* 会员类型 */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${currentConfig.bgColor}`}>
          <Crown className={`h-5 w-5 ${currentConfig.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {currentConfig.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {currentConfig.description}
          </p>
        </div>
      </div>

      {/* 会员权益 */}
      <div className="space-y-2 mb-4">
        <BenefitItem
          text={
            isFree
              ? isZh
                ? "每日3次查询"
                : "3 searches/day"
              : isZh
              ? "无限次查询"
              : "Unlimited searches"
          }
        />
        <BenefitItem
          text={
            isFree
              ? isZh
                ? "显示10条痛点"
                : "10 pain points/search"
              : isZh
              ? "显示20条痛点"
              : "20 pain points/search"
          }
        />
        <BenefitItem
          text={
            isFree
              ? isZh
                ? "Reddit & X 平台"
                : "Reddit & X platforms"
              : isZh
              ? "全平台支持"
              : "All platforms"
          }
        />
        {!isFree && (
          <>
            <BenefitItem
              text={isZh ? "AI深度分析" : "AI deep analysis"}
            />
            <BenefitItem
              text={isZh ? "数据导出" : "Data export"}
            />
            <BenefitItem
              text={isZh ? "查询历史" : "Search history"}
            />
          </>
        )}
      </div>

      {/* 到期时间或升级按钮 */}
      {expiresAt && !isFree ? (
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Calendar className="h-4 w-4" />
          <span>
            {isZh ? "到期时间：" : "Expires: "}
            {new Date(expiresAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
          </span>
        </div>
      ) : isFree ? (
        <Link href="/pricing" className="block">
          <Button className="w-full" size="sm">
            {isZh ? "升级会员" : "Upgrade Now"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      ) : null}
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
      <span>{text}</span>
    </div>
  );
}

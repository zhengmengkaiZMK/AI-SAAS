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
  const isEnterprise = membershipType === "ENTERPRISE";

  const config = {
    FREE: {
      title: isZh ? "免费计划" : "Free Plan",
      description: isZh
        ? "升级以解锁更多功能"
        : "Upgrade to unlock more features",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-600 dark:text-gray-400",
      iconColor: "text-gray-500",
    },
    PREMIUM: {
      title: isZh ? "高级会员" : "Premium",
      description: isZh ? "享受高级功能" : "Enjoy premium features",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-800 dark:text-yellow-400",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    ENTERPRISE: {
      title: isZh ? "企业版" : "Enterprise",
      description: isZh ? "全部功能无限制" : "Unlimited everything",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-800 dark:text-purple-400",
      iconColor: "text-purple-600 dark:text-purple-400",
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
                ? "3 次搜索/天"
                : "3 searches/day"
              : isPremium
              ? isZh
                ? "100 次搜索/天"
                : "100 searches/day"
              : isZh
              ? "无限搜索"
              : "Unlimited searches"
          }
        />
        <BenefitItem
          text={
            isFree
              ? isZh
                ? "10 条消息/天"
                : "10 messages/day"
              : isPremium
              ? isZh
                ? "500 条消息/天"
                : "500 messages/day"
              : isZh
              ? "无限消息"
              : "Unlimited messages"
          }
        />
        {!isFree && (
          <>
            <BenefitItem
              text={isZh ? "优先支持" : "Priority support"}
            />
            <BenefitItem
              text={isZh ? "历史记录保存" : "History saved"}
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

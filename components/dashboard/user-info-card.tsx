"use client";

import { usePathname } from "next/navigation";
import { User, Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserInfoCardProps {
  user: {
    name: string;
    email: string;
    membershipType: string;
    avatar: string | null;
    memberSince: string;
  };
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isZh
      ? date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
      {/* 头像和基本信息 */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {user.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {user.email}
          </p>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <User className="h-4 w-4 text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-300">
            {isZh ? "会员类型" : "Membership"}
          </span>
          <span className="ml-auto font-medium text-black dark:text-white">
            {getMembershipLabel(user.membershipType, isZh)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-300">
            {isZh ? "邮箱" : "Email"}
          </span>
          <span className="ml-auto font-medium text-black dark:text-white truncate max-w-[180px]">
            {user.email}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <span className="text-neutral-600 dark:text-neutral-300">
            {isZh ? "加入时间" : "Member Since"}
          </span>
          <span className="ml-auto font-medium text-black dark:text-white">
            {formatDate(user.memberSince)}
          </span>
        </div>
      </div>
    </div>
  );
}

function getMembershipLabel(type: string, isZh: boolean): string {
  switch (type) {
    case "PREMIUM":
      return isZh ? "专业版" : "Professional";
    default:
      return isZh ? "免费版" : "Free";
  }
}

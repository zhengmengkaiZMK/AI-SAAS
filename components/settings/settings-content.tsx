"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UpdateNameForm } from "./update-name-form";
import { UpdatePasswordForm } from "./update-password-form";
import { User, Lock } from "lucide-react";

export function SettingsContent() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          {isZh ? "账户设置" : "Account Settings"}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {isZh
            ? "管理您的个人信息和账户安全"
            : "Manage your personal information and account security"}
        </p>
      </div>

      {/* 标签导航 */}
      <div className="mb-8">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "profile"
                    ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                }
              `}
            >
              <User className="h-4 w-4" />
              {isZh ? "个人信息" : "Profile"}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === "password"
                    ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                }
              `}
            >
              <Lock className="h-4 w-4" />
              {isZh ? "安全设置" : "Security"}
            </button>
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
        {activeTab === "profile" && (
          <UpdateNameForm
            currentName={session.user.name || ""}
            currentEmail={session.user.email}
          />
        )}
        {activeTab === "password" && <UpdatePasswordForm />}
      </div>
    </div>
  );
}

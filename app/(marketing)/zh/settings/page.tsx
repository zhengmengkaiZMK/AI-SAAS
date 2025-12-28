import { SettingsContent } from "@/components/settings/settings-content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "账户设置 | AI SaaS",
  description: "管理您的个人信息和账户安全",
};

export default async function ZhSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <SettingsContent />;
}

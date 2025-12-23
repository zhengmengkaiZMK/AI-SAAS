import { NavBar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Pricing", link: "/pricing" },
    { title: "Home", link: "/" },
  ];

  return (
    <div className="relative overflow-hidden">
      <NavBar navItems={navItems} />
      <main className="pt-20">{children}</main>
    </div>
  );
}

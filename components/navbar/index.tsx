"use client";
import { DesktopNavbar } from "./desktop-navbar";
import { MobileNavbar } from "./mobile-navbar";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const navItems = [
    {
      title: isZh ? "价格" : "Pricing",
      link: isZh ? "/zh/pricing" : "/pricing",
    },
    {
      title: isZh ? "博客" : "Blog",
      link: isZh ? "/zh/blog" : "/blog",
    },
    {
      title: isZh ? "文档" : "Docs",
      link: isZh ? "/zh/docs" : "/docs",
    },
    {
      title: isZh ? "联系我们" : "Contact",
      link: isZh ? "/zh/contact" : "/contact",
    },
  ];

  return (
    <motion.nav
      initial={{
        y: -80,
      }}
      animate={{
        y: 0,
      }}
      transition={{
        ease: [0.6, 0.05, 0.1, 0.9],
        duration: 0.8,
      }}
      className="max-w-7xl  fixed top-4  mx-auto inset-x-0 z-50 w-[95%] lg:w-full"
    >
      <div className="hidden lg:block w-full">
        <DesktopNavbar navItems={navItems} />
      </div>
      <div className="flex h-full w-full items-center lg:hidden ">
        <MobileNavbar navItems={navItems} />
      </div>
    </motion.nav>
  );
}

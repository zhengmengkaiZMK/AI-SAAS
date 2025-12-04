"use client";
import { Link } from "next-view-transitions";
import React from "react";
import { usePathname } from "next/navigation";

export const Logo = () => {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const homeLink = isZh ? "/zh" : "/";

  return (
    <Link
      href={homeLink}
      className="font-normal flex space-x-2 items-center text-sm mr-4  text-black px-2 py-1  relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
      <span className="font-medium text-black dark:text-white">Every AI</span>
    </Link>
  );
};

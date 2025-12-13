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
      {/* SaltMine Logo - 结合阶梯数据块与晶体切面，象征数据结晶 */}
      <div className="relative w-6 h-5 flex items-end justify-center gap-[2px]">
        {/* 第一层（最高）- 晶体尖端 */}
        <div className="w-1 h-5 bg-black dark:bg-white rounded-t-[2px] rounded-b-[1px]" />
        {/* 第二层 - 晶体切面 */}
        <div className="w-1 h-4 bg-black dark:bg-white rounded-[1px]" style={{ opacity: 0.85 }} />
        {/* 第三层 - 晶体切面 */}
        <div className="w-1 h-3 bg-black dark:bg-white rounded-[1px]" style={{ opacity: 0.7 }} />
        {/* 第四层（最深）- 晶体基座 */}
        <div className="w-1 h-2 bg-black dark:bg-white rounded-b-[2px] rounded-t-[1px]" style={{ opacity: 0.55 }} />
      </div>
      <span className="font-medium text-black dark:text-white">SaltMine</span>
    </Link>
  );
};

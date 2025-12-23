"use client";

import { usePathname } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelledPage() {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 text-center border border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            {isZh ? "支付已取消" : "Payment Cancelled"}
          </h1>
          
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {isZh
              ? "您的支付已被取消，没有任何费用产生。"
              : "Your payment has been cancelled. No charges were made."}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-full px-6 py-3 font-semibold transition"
            >
              {isZh ? "重新选择方案" : "Choose Plan Again"}
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isZh ? "返回首页" : "Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

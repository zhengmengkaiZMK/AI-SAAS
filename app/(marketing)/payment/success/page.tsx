"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");
  const { data: session, update } = useSession();
  
  const paymentId = searchParams.get("paymentId");
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [membershipInfo, setMembershipInfo] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setError(isZh ? "缺少支付ID" : "Missing payment ID");
      setLoading(false);
      return;
    }

    // 获取支付详情和会员信息
    Promise.all([
      fetch(`/api/payment/status/${paymentId}`).then((res) => res.json()),
      fetch("/api/user/refresh-session").then((res) => res.json()),
    ])
      .then(([paymentData, userInfo]) => {
        if (paymentData.error) {
          setError(paymentData.error);
        } else {
          setPaymentDetails(paymentData);
        }
        
        if (!userInfo.error && userInfo.user) {
          setMembershipInfo(userInfo.user);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paymentId, isZh]);

  // 获取会员徽章
  const getMembershipBadge = (type: string) => {
    if (type === "PREMIUM") {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="h-4 w-4 mr-1" />
          {isZh ? "专业版" : "Professional"}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">
            {isZh ? "验证支付状态..." : "Verifying payment..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 text-center border border-neutral-200 dark:border-neutral-800">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
              {isZh ? "验证失败" : "Verification Failed"}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {error || (isZh ? "无法验证支付状态" : "Cannot verify payment status")}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-neutral-900 hover:bg-black text-white rounded-full px-6 py-3 font-medium transition"
            >
              {isZh ? "返回仪表盘" : "Back to Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="max-w-2xl w-full">
        {/* 成功动画 */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-8 md:p-12 border border-neutral-200 dark:border-neutral-800">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-3">
              {isZh ? "支付成功！" : "Payment Successful!"}
            </h1>
            
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
              {isZh 
                ? "感谢您的购买，您的会员已激活"
                : "Thank you for your purchase. Your membership is now active."}
            </p>

            {/* 会员状态 */}
            {membershipInfo && (
              <div className="mt-6 inline-block">
                {getMembershipBadge(membershipInfo.membershipType)}
              </div>
            )}
          </div>

          {/* 支付详情 */}
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-4">
              {isZh ? "订单详情" : "Order Details"}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {isZh ? "订单ID" : "Order ID"}
                </span>
                <span className="font-mono text-sm text-black dark:text-white">
                  {paymentDetails.id.slice(0, 8)}...
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {isZh ? "方案" : "Plan"}
                </span>
                <span className="font-semibold text-black dark:text-white">
                  {paymentDetails.planId}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {isZh ? "金额" : "Amount"}
                </span>
                <span className="font-semibold text-black dark:text-white">
                  ${paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {isZh ? "状态" : "Status"}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  {paymentDetails.status}
                </span>
              </div>

              {/* 会员到期时间 */}
              {membershipInfo?.membershipExpiresAt && (
                <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {isZh ? "到期时间" : "Expires At"}
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {new Date(membershipInfo.membershipExpiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-full px-6 py-3 font-semibold transition text-center inline-flex items-center justify-center"
            >
              {isZh ? "前往仪表盘" : "Go to Dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link
              href="/"
              className="flex-1 bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-full px-6 py-3 font-semibold transition text-center"
            >
              {isZh ? "返回首页" : "Back to Home"}
            </Link>
          </div>
        </div>

        {/* 下一步提示 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isZh 
              ? "您的会员权限已实时生效，请刷新页面查看最新状态"
              : "Your membership privileges are now active. Please refresh the page to see the latest status."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

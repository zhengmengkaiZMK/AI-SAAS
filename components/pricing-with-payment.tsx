"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PayPalButton } from "./payment/paypal-button";
import { X } from "lucide-react";

// 定义价格方案
const pricingTiers = [
  {
    id: "hobby",
    name: "Hobby",
    nameZh: "Hobby",
    monthly: 4,
    yearly: 30,
    description: "Best for developers trying to use the platform.",
    descriptionZh: "最适合尝试使用平台的开发者",
    features: [
      "5 API requests per day",
      "Access to basic API endpoints",
      "Email support within 48 hours",
      "Community forum access",
      "Monthly newsletter",
    ],
    featuresZh: [
      "每日5次API请求",
      "访问基础API端点",
      "48小时内邮件支持",
      "社区论坛访问",
      "月度时事通讯",
    ],
    cta: "Browse Components",
    ctaZh: "浏览组件",
    featured: false,
    showPayPal: true,
  },
  {
    id: "starter",
    name: "Starter",
    nameZh: "Starter",
    monthly: 8,
    yearly: 60,
    description: "Perfect for small businesses",
    descriptionZh: "完美适合小型企业",
    features: [
      "Everything in Hobby, plus",
      "50 API requests per day",
      "Access to advanced API endpoints",
      "Email support within 24 hours",
      "Community forum access",
      "Monthly newsletter",
      "Self hosting options",
    ],
    featuresZh: [
      "Hobby所有功能",
      "每日50次API请求",
      "访问高级API端点",
      "24小时内邮件支持",
      "社区论坛访问",
      "月度时事通讯",
      "自托管选项",
    ],
    cta: "Buy Now",
    ctaZh: "立即购买",
    featured: false,
    showPayPal: true,
  },
  {
    id: "professional",
    name: "Professional",
    nameZh: "Professional",
    monthly: 12,
    yearly: 100,
    description: "Ideal for small to mid range startups",
    descriptionZh: "适合中小型初创公司",
    features: [
      "Everything in Starter, plus",
      "500 API requests per day",
      "Access to super advanced API endpoints",
      "Email support within 12 hours",
      "Private Community access",
      "Monthly retreats",
      "Self hosting options",
      "Private infrastructure",
      "On-Prem deployments",
    ],
    featuresZh: [
      "Starter所有功能",
      "每日500次API请求",
      "访问超级高级API端点",
      "12小时内邮件支持",
      "私有社区访问",
      "月度聚会",
      "自托管选项",
      "私有基础设施",
      "本地部署",
    ],
    cta: "Buy Now",
    ctaZh: "立即购买",
    featured: true,
    showPayPal: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameZh: "Enterprise",
    monthly: null,
    yearly: null,
    priceDisplay: "Contact Us",
    priceDisplayZh: "联系我们",
    description: "Best for big fortune 500 companies.",
    descriptionZh: "最适合大型500强企业",
    features: [
      "Everything in professional, plus",
      "500K API requests per day",
      "Access to super advanced API endpoints",
      "Email support within 12 hours",
      "Private Community access",
      "Monthly retreats",
      "Self hosting options",
      "Private infrastructure",
      "On-Prem deployments",
      "I retweet your tweets personally",
    ],
    featuresZh: [
      "Professional所有功能",
      "每日50万次API请求",
      "访问超级高级API端点",
      "12小时内邮件支持",
      "私有社区访问",
      "月度聚会",
      "自托管选项",
      "私有基础设施",
      "本地部署",
      "我会亲自转发你的推文",
    ],
    cta: "Contact Us",
    ctaZh: "联系我们",
    featured: false,
    showPayPal: false,
  },
];

export function PricingWithPayment() {
  const pathname = usePathname();
  const router = useRouter();
  const isZh = pathname.startsWith("/zh");

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const tabs = [
    { name: isZh ? "月付" : "Monthly", value: "monthly" as const },
    { name: isZh ? "年付" : "Yearly", value: "yearly" as const },
  ];

  const handlePlanClick = (tier: typeof pricingTiers[0]) => {
    if (tier.id === "enterprise") {
      router.push("mailto:support@example.com");
      return;
    }

    if (tier.showPayPal) {
      setSelectedPlan(tier.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
  };

  const selectedTier = pricingTiers.find((t) => t.id === selectedPlan);
  const planId = selectedTier
    ? `${selectedTier.id.toUpperCase()}_${billingCycle.toUpperCase()}`
    : "";
  const amount = selectedTier
    ? billingCycle === "monthly"
      ? selectedTier.monthly
      : selectedTier.yearly
    : 0;

  return (
    <>
      <div className="relative">
        {/* 计费周期切换 */}
        <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 w-fit mx-auto mb-12 rounded-md overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={cn(
                "text-sm font-medium p-4 rounded-md relative",
                billingCycle === tab.value
                  ? "text-white dark:text-black"
                  : "text-gray-500 dark:text-muted-dark"
              )}
              onClick={() => setBillingCycle(tab.value)}
            >
              {billingCycle === tab.value && (
                <motion.span
                  layoutId="moving-div"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="absolute inset-0 bg-black dark:bg-white"
                />
              )}
              <span className="relative z-10">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 价格卡片 */}
        <div className="mx-auto mt-4 md:mt-20 grid relative z-20 grid-cols-1 gap-4 items-center md:grid-cols-2 xl:grid-cols-4">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                tier.featured
                  ? "relative bg-[radial-gradient(164.75%_100%_at_50%_0%,#334155_0%,#0F172A_48.73%)] shadow-2xl"
                  : "bg-white dark:bg-black",
                "rounded-lg px-6 py-8 sm:mx-8 lg:mx-0 h-full flex flex-col justify-between"
              )}
            >
              <div>
                <h3
                  className={cn(
                    tier.featured ? "text-white" : "text-muted dark:text-muted-dark",
                    "text-base font-semibold leading-7"
                  )}
                >
                  {isZh ? tier.nameZh : tier.name}
                </h3>
                
                <p className="mt-4">
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    key={billingCycle}
                    className={cn(
                      "text-4xl font-bold tracking-tight inline-block",
                      tier.featured ? "text-white" : "text-neutral-900 dark:text-neutral-200"
                    )}
                  >
                    {tier.priceDisplay
                      ? isZh
                        ? tier.priceDisplayZh
                        : tier.priceDisplay
                      : billingCycle === "monthly"
                      ? `$${tier.monthly}/mo`
                      : `$${tier.yearly}/yr`}
                  </motion.span>
                </p>

                <p
                  className={cn(
                    tier.featured ? "text-neutral-300" : "text-neutral-600 dark:text-neutral-300",
                    "mt-6 text-sm leading-7 h-12 md:h-12 xl:h-12"
                  )}
                >
                  {isZh ? tier.descriptionZh : tier.description}
                </p>

                <ul
                  role="list"
                  className={cn(
                    tier.featured ? "text-neutral-300" : "text-neutral-600 dark:text-neutral-300",
                    "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
                  )}
                >
                  {(isZh ? tier.featuresZh : tier.features).map((feature, idx) => (
                    <li key={idx} className="flex gap-x-3">
                      <IconCircleCheckFilled
                        className={cn(
                          tier.featured ? "text-white" : "text-muted dark:text-muted-dark",
                          "h-6 w-5 flex-none"
                        )}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  onClick={() => handlePlanClick(tier)}
                  className={cn(
                    tier.featured
                      ? "bg-white text-black shadow-sm hover:bg-white/90 focus-visible:outline-white"
                      : "bg-neutral-900 hover:bg-black/90 border border-transparent text-white",
                    "relative z-10 md:text-sm transition duration-200 items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF40_inset,_0px_1px_0px_0px_#FFFFFF40_inset] mt-8 rounded-full py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 block w-full"
                  )}
                >
                  {isZh ? tier.ctaZh : tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PayPal支付弹窗 */}
      <AnimatePresence>
        {selectedPlan && selectedTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 标题 */}
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                {isZh ? "完成支付" : "Complete Payment"}
              </h2>
              
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {isZh ? `您选择了 ${selectedTier.nameZh} 方案` : `You selected the ${selectedTier.name} plan`}
              </p>

              {/* 方案详情 */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isZh ? "方案" : "Plan"}
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {isZh ? selectedTier.nameZh : selectedTier.name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isZh ? "计费周期" : "Billing Cycle"}
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {billingCycle === "monthly" ? (isZh ? "月付" : "Monthly") : (isZh ? "年付" : "Yearly")}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isZh ? "总计" : "Total"}
                  </span>
                  <span className="text-xl font-bold text-black dark:text-white">
                    ${amount}
                  </span>
                </div>
              </div>

              {/* PayPal按钮 */}
              <PayPalButton
                planId={planId}
                amount={amount || 0}
                planName={isZh ? selectedTier.nameZh : selectedTier.name}
                billingCycle={billingCycle.toUpperCase() as "MONTHLY" | "YEARLY"}
                onSuccess={() => {
                  setSelectedPlan(null);
                }}
                onError={(error) => {
                  console.error("Payment error:", error);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

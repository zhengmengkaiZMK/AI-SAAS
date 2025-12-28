/**
 * 价格方案配置
 * 统一管理所有支付方案
 */

import { PricingPlan } from "@/types/payment";

export const PRICING_PLANS: Record<string, PricingPlan> = {
  // ========== FREE方案（无需支付）==========
  FREE: {
    id: "FREE",
    tier: "FREE",
    name: "Free",
    nameZh: "免费版",
    billingCycle: "MONTHLY",
    amount: 0,
    currency: "USD",
    membershipType: "FREE",
    durationDays: 9999, // 永久有效
    features: [
      "5 searches per day",
      "Reddit & X platform support",
      "10 pain points per search",
      "Basic keyword analysis",
      "Email support within 48 hours",
    ],
    featuresZh: [
      "每日5次免费查询",
      "支持 Reddit 和 X 平台",
      "每次显示10条用户痛点",
      "基础关键词分析",
      "48小时内邮件支持",
    ],
  },

  // ========== PROFESSIONAL方案 (PREMIUM) ==========
  PROFESSIONAL_MONTHLY: {
    id: "PROFESSIONAL_MONTHLY",
    tier: "PROFESSIONAL",
    name: "Professional Monthly",
    nameZh: "专业版 月付",
    billingCycle: "MONTHLY",
    amount: 10.0,
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 30,
    features: [
      "Unlimited searches per day",
      "All platforms support (Reddit, X, ProductHunt, HN, etc.)",
      "20 pain points per search",
      "AI-powered deep analysis & insights",
      "Direct links to original posts",
      "Export data (CSV/JSON)",
      "Priority email support within 12 hours",
      "Search history saved",
    ],
    featuresZh: [
      "每日不限次数查询",
      "全平台支持（Reddit、X、ProductHunt、Hacker News等）",
      "每次显示20条用户痛点",
      "AI驱动的深度分析和洞察",
      "可直接跳转痛点原帖地址",
      "支持数据导出（CSV/JSON）",
      "12小时内优先邮件支持",
      "保存所有查询历史",
    ],
  },
  PROFESSIONAL_YEARLY: {
    id: "PROFESSIONAL_YEARLY",
    tier: "PROFESSIONAL",
    name: "Professional Yearly",
    nameZh: "专业版 年付",
    billingCycle: "YEARLY",
    amount: 96.0, // 原价120, 8折优惠
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 365,
    features: [
      "Unlimited searches per day",
      "All platforms support (Reddit, X, ProductHunt, HN, etc.)",
      "20 pain points per search",
      "AI-powered deep analysis & insights",
      "Direct links to original posts",
      "Export data (CSV/JSON)",
      "Priority email support within 12 hours",
      "Search history saved",
      "Save $24 per year (20% discount)",
    ],
    featuresZh: [
      "每日不限次数查询",
      "全平台支持（Reddit、X、ProductHunt、Hacker News等）",
      "每次显示20条用户痛点",
      "AI驱动的深度分析和洞察",
      "可直接跳转痛点原帖地址",
      "支持数据导出（CSV/JSON）",
      "12小时内优先邮件支持",
      "保存所有查询历史",
      "每年节省$24（8折优惠）",
    ],
  },
};

// 根据Tier和BillingCycle获取方案
export function getPricingPlan(
  tier: string,
  billingCycle: "MONTHLY" | "YEARLY"
): PricingPlan | undefined {
  const planId = `${tier.toUpperCase()}_${billingCycle}`;
  return PRICING_PLANS[planId];
}

// 获取所有方案
export function getAllPlans(): PricingPlan[] {
  return Object.values(PRICING_PLANS);
}

// 根据方案ID获取
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS[planId];
}

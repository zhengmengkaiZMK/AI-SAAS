/**
 * 价格方案配置
 * 统一管理所有支付方案
 */

import { PricingPlan } from "@/types/payment";

export const PRICING_PLANS: Record<string, PricingPlan> = {
  // ========== HOBBY方案 ==========
  HOBBY_MONTHLY: {
    id: "HOBBY_MONTHLY",
    tier: "HOBBY",
    name: "Hobby Monthly",
    nameZh: "Hobby 月付",
    billingCycle: "MONTHLY",
    amount: 4.0,
    currency: "USD",
    membershipType: "FREE",
    durationDays: 30,
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
  },
  HOBBY_YEARLY: {
    id: "HOBBY_YEARLY",
    tier: "HOBBY",
    name: "Hobby Yearly",
    nameZh: "Hobby 年付",
    billingCycle: "YEARLY",
    amount: 30.0,
    currency: "USD",
    membershipType: "FREE",
    durationDays: 365,
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
  },

  // ========== STARTER方案 (PREMIUM) ==========
  STARTER_MONTHLY: {
    id: "STARTER_MONTHLY",
    tier: "STARTER",
    name: "Starter Monthly",
    nameZh: "Starter 月付",
    billingCycle: "MONTHLY",
    amount: 8.0,
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 30,
    features: [
      "Everything in Hobby, plus",
      "50 API requests per day",
      "Access to advanced API endpoints",
      "Email support within 24 hours",
      "Self hosting options",
    ],
    featuresZh: [
      "Hobby所有功能",
      "每日50次API请求",
      "访问高级API端点",
      "24小时内邮件支持",
      "自托管选项",
    ],
  },
  STARTER_YEARLY: {
    id: "STARTER_YEARLY",
    tier: "STARTER",
    name: "Starter Yearly",
    nameZh: "Starter 年付",
    billingCycle: "YEARLY",
    amount: 60.0,
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 365,
    features: [
      "Everything in Hobby, plus",
      "50 API requests per day",
      "Access to advanced API endpoints",
      "Email support within 24 hours",
      "Self hosting options",
    ],
    featuresZh: [
      "Hobby所有功能",
      "每日50次API请求",
      "访问高级API端点",
      "24小时内邮件支持",
      "自托管选项",
    ],
  },

  // ========== PROFESSIONAL方案 (PREMIUM) ==========
  PROFESSIONAL_MONTHLY: {
    id: "PROFESSIONAL_MONTHLY",
    tier: "PROFESSIONAL",
    name: "Professional Monthly",
    nameZh: "Professional 月付",
    billingCycle: "MONTHLY",
    amount: 12.0,
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 30,
    features: [
      "Everything in Starter, plus",
      "500 API requests per day",
      "Access to super advanced API endpoints",
      "Email support within 12 hours",
      "Private Community access",
      "Private infrastructure",
    ],
    featuresZh: [
      "Starter所有功能",
      "每日500次API请求",
      "访问超级高级API端点",
      "12小时内邮件支持",
      "私有社区访问",
      "私有基础设施",
    ],
  },
  PROFESSIONAL_YEARLY: {
    id: "PROFESSIONAL_YEARLY",
    tier: "PROFESSIONAL",
    name: "Professional Yearly",
    nameZh: "Professional 年付",
    billingCycle: "YEARLY",
    amount: 100.0,
    currency: "USD",
    membershipType: "PREMIUM",
    durationDays: 365,
    features: [
      "Everything in Starter, plus",
      "500 API requests per day",
      "Access to super advanced API endpoints",
      "Email support within 12 hours",
      "Private Community access",
      "Private infrastructure",
    ],
    featuresZh: [
      "Starter所有功能",
      "每日500次API请求",
      "访问超级高级API端点",
      "12小时内邮件支持",
      "私有社区访问",
      "私有基础设施",
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

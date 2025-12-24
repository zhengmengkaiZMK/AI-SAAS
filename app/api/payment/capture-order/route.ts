/**
 * PayPal捕获支付API
 * POST /api/payment/capture-order
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { capturePayPalOrder } from "@/lib/payment/paypal-config";
import { prisma } from "@/lib/db/prisma";
import { CaptureOrderRequest } from "@/types/payment";
import { getPlanById } from "@/constants/pricing-plans";

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 解析请求
    const body: CaptureOrderRequest = await request.json();
    const { orderID } = body;

    if (!orderID) {
      return NextResponse.json(
        { error: "Missing orderID parameter" },
        { status: 400 }
      );
    }

    // 检查订单是否已处理（幂等性检查）
    const existingPayment = await prisma.payment.findUnique({
      where: { providerOrderId: orderID },
    });

    if (existingPayment) {
      console.log("[PayPal] 订单已处理:", orderID);
      
      if (existingPayment.status === "COMPLETED") {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { membershipType: true, membershipExpiresAt: true },
        });

        return NextResponse.json({
          success: true,
          paymentId: existingPayment.id,
          membershipType: user?.membershipType,
          expiresAt: user?.membershipExpiresAt?.toISOString(),
          message: "Payment already processed",
        });
      }
    }

    // 捕获PayPal支付
    const capture = await capturePayPalOrder(orderID);

    console.log("[PayPal] 支付捕获成功:", {
      orderID,
      captureID: capture.id,
      status: capture.status,
    });

    // 验证支付状态
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${capture.status}` },
        { status: 400 }
      );
    }

    // 提取支付信息
    const purchaseUnit = capture.purchase_units[0];
    const captureDetails = purchaseUnit.payments?.captures?.[0];

    if (!captureDetails) {
      return NextResponse.json(
        { error: "No capture details found in PayPal response" },
        { status: 400 }
      );
    }

    const amount = parseFloat(captureDetails.amount.value);
    const currency = captureDetails.amount.currency_code;
    const captureID = captureDetails.id;
    const customId = purchaseUnit.custom_id || userId;

    // 根据金额推断方案（更安全的做法是在订单元数据中存储planId）
    const planId = inferPlanIdFromAmount(amount);
    const plan = getPlanById(planId);

    if (!plan) {
      console.error("[PayPal] 无法识别支付方案:", { amount, currency });
      return NextResponse.json(
        { error: "Cannot determine pricing plan from payment amount" },
        { status: 400 }
      );
    }

    // 计算会员到期时间
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // 使用事务更新数据库
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建支付记录
      const payment = await tx.payment.create({
        data: {
          userId: customId,
          provider: "PAYPAL",
          providerOrderId: orderID,
          providerPaymentId: captureID,
          amount,
          currency,
          planId: plan.id,
          status: "COMPLETED",
          completedAt: new Date(),
          metadata: {
            paypalOrderId: orderID,
            paypalCaptureId: captureID,
            planName: plan.name,
            billingCycle: plan.billingCycle,
          },
        },
      });

      // 2. 更新用户会员状态
      const user = await tx.user.update({
        where: { id: customId },
        data: {
          membershipType: plan.membershipType,
          membershipExpiresAt: expiresAt,
        },
        select: {
          id: true,
          email: true,
          membershipType: true,
          membershipExpiresAt: true,
        },
      });

      // 3. 更新用户配额限制
      const quotaLimits = getQuotaLimits(plan.membershipType);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      await tx.userQuota.upsert({
        where: {
          unique_user_date: {
            userId: customId,
            date: today,
          },
        },
        update: {
          searchesLimit: quotaLimits.searches,
          messagesLimit: quotaLimits.messages,
        },
        create: {
          userId: customId,
          date: today,
          searchesUsed: 0,
          messagesUsed: 0,
          searchesLimit: quotaLimits.searches,
          messagesLimit: quotaLimits.messages,
        },
      });

      return { payment, user };
    });

    console.log("[PayPal] 会员升级成功:", {
      userId: customId,
      membershipType: result.user.membershipType,
      expiresAt: result.user.membershipExpiresAt,
      paymentId: result.payment.id,
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      paymentId: result.payment.id,
      membershipType: result.user.membershipType,
      expiresAt: result.user.membershipExpiresAt?.toISOString(),
    });
  } catch (error: any) {
    console.error("[PayPal] 捕获支付失败:", error);

    // 创建失败记录
    try {
      const body: CaptureOrderRequest = await request.json();
      const session = await getServerSession(authOptions);
      
      if (session?.user?.id && body.orderID) {
        await prisma.payment.create({
          data: {
            userId: session.user.id,
            provider: "PAYPAL",
            providerOrderId: body.orderID,
            amount: 0,
            currency: "USD",
            planId: "UNKNOWN",
            status: "FAILED",
            metadata: {
              error: error.message,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    } catch (dbError) {
      console.error("[PayPal] 记录失败支付出错:", dbError);
    }

    return NextResponse.json(
      {
        error: "Failed to capture PayPal payment",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// 根据金额推断方案ID（临时方案，建议在订单元数据中存储）
function inferPlanIdFromAmount(amount: number): string {
  const amountMap: Record<number, string> = {
    10: "PROFESSIONAL_MONTHLY",
    96: "PROFESSIONAL_YEARLY",
  };

  return amountMap[amount] || "UNKNOWN";
}

// 根据会员类型获取配额限制
function getQuotaLimits(membershipType: string): { searches: number; messages: number } {
  switch (membershipType) {
    case "PREMIUM":
      return { searches: 999999, messages: 999999 }; // Professional: 无限制
    default: // FREE
      return { searches: 3, messages: 10 }; // Free: 每日3次搜索
  }
}

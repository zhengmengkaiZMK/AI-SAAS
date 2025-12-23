/**
 * 支付状态查询API
 * GET /api/payment/status/[paymentId]
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentId } = params;

    // 查询支付记录
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        planId: true,
        createdAt: true,
        completedAt: true,
        userId: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // 验证所有权
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
      planId: payment.planId,
      createdAt: payment.createdAt.toISOString(),
      completedAt: payment.completedAt?.toISOString(),
    });
  } catch (error) {
    console.error("[Payment] 查询状态失败:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}

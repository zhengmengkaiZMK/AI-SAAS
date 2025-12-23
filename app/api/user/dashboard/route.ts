import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        membershipType: true,
        membershipExpiresAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 获取今日配额
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let todayQuota = await prisma.userQuota.findUnique({
      where: {
        unique_user_date: {
          userId,
          date: today,
        },
      },
    });

    // 如果今日配额不存在，创建一个
    if (!todayQuota) {
      const quotaLimits = getQuotaLimits(user.membershipType);
      
      todayQuota = await prisma.userQuota.create({
        data: {
          userId,
          date: today,
          searchesUsed: 0,
          messagesUsed: 0,
          searchesLimit: quotaLimits.searches,
          messagesLimit: quotaLimits.messages,
        },
      });
    }

    // 获取总体统计
    const allQuotas = await prisma.userQuota.findMany({
      where: { userId },
      select: {
        searchesUsed: true,
      },
    });

    const totalSearches = allQuotas.reduce((sum, q) => sum + q.searchesUsed, 0);

    // 返回仪表盘数据
    return NextResponse.json({
      quota: {
        date: todayQuota.date.toISOString(),
        searchesUsed: todayQuota.searchesUsed,
        searchesLimit: todayQuota.searchesLimit,
      },
      stats: {
        totalSearches,
        memberSince: user.createdAt.toISOString(),
      },
      user: {
        name: user.name,
        email: user.email,
        membershipType: user.membershipType,
        membershipExpiresAt: user.membershipExpiresAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard data",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// 根据会员类型获取配额限制
function getQuotaLimits(membershipType: string): { searches: number; messages: number } {
  switch (membershipType) {
    case "PREMIUM":
      return { searches: 100, messages: 500 };
    case "ENTERPRISE":
      return { searches: 1000, messages: 5000 };
    default: // FREE
      return { searches: 3, messages: 10 };
  }
}

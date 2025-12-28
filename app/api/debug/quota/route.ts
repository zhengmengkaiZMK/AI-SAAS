import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

/**
 * 配额调试 API
 * GET /api/debug/quota
 */
export async function GET(req: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 1. 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        membershipType: true,
        createdAt: true,
      },
    });

    // 2. 获取今日配额
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

    // 3. 获取所有历史配额
    const allQuotas = await prisma.userQuota.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // 4. 数据库时间
    const dbTime = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

    return NextResponse.json({
      debug: {
        serverTime: new Date().toISOString(),
        dbTime: dbTime[0]?.now,
        todayDateUTC: today.toISOString(),
      },
      user: user,
      todayQuota: todayQuota,
      history: allQuotas.map(q => ({
        date: q.date.toISOString().split('T')[0],
        used: q.searchesUsed,
        limit: q.searchesLimit,
        createdAt: q.createdAt,
      })),
    });

  } catch (error) {
    console.error('Debug quota API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch debug data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * 手动增加配额（测试用）
 * POST /api/debug/quota
 */
export async function POST(req: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取或创建今日配额
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

    if (!todayQuota) {
      todayQuota = await prisma.userQuota.create({
        data: {
          userId,
          date: today,
          searchesUsed: 0,
          messagesUsed: 0,
          searchesLimit: 5,
          messagesLimit: 10,
        },
      });
    }

    // 增加配额
    const updated = await prisma.userQuota.update({
      where: { id: todayQuota.id },
      data: { searchesUsed: { increment: 1 } },
    });

    return NextResponse.json({
      message: 'Quota incremented successfully',
      before: todayQuota.searchesUsed,
      after: updated.searchesUsed,
      quota: updated,
    });

  } catch (error) {
    console.error('Debug quota POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to increment quota',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

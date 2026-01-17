import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  const result: any = {
    app: "ok",
    db: { status: "unknown" },
    redis: { status: "unknown" },
    timestamp: new Date().toISOString(),
  };

  // Check DB connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.db.status = "ok";
  } catch (e: any) {
    result.db = { status: "error", error: e?.message ?? String(e) };
  }

  // Check Redis connectivity (optional)
  try {
    const pong = await redis.ping();
    result.redis.status = pong === "PONG" ? "ok" : "error";
  } catch (e: any) {
    result.redis = { status: "error", error: e?.message ?? String(e) };
  }

  const statusCode = result.db.status === "ok" ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
}

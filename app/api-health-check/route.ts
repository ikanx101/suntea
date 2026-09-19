import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; error?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (err) {
    checks.database = {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal terhubung ke database",
    };
  }

  const missingEnv = ["DATABASE_URL", "AUTH_SECRET", "NEXTAUTH_URL"].filter(
    (key) => !process.env[key],
  );
  checks.env = {
    ok: missingEnv.length === 0,
    ...(missingEnv.length > 0 && { error: `Env var belum diisi: ${missingEnv.join(", ")}` }),
  };

  const allOk = Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "error",
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startedAt,
      checks,
    },
    { status: allOk ? 200 : 503 },
  );
}

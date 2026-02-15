import { deactivateByToken, getSubscriptionByToken } from "@/lib/repos/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  token: z.string().min(1, "Token required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ token: searchParams.get("token") });
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.errors[0]?.message } },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const subscription = await getSubscriptionByToken(admin, parsed.data.token);
    if (!subscription) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Invalid or expired unsubscribe link" } },
        { status: 404 }
      );
    }

    const ok = await deactivateByToken(admin, parsed.data.token);
    if (!ok) {
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Failed to unsubscribe" } },
        { status: 500 }
      );
    }
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

import { TOPICS, isTopicSlug } from "@/config/topics";
import { upsertSubscription } from "@/lib/repos/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  topic_filters: z
    .array(z.string().refine(isTopicSlug, "Invalid topic"))
    .min(1, "Select at least one topic")
    .max(TOPICS.length),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid body",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const subscription = await upsertSubscription(
      user.id,
      parsed.data.email,
      parsed.data.topic_filters
    );
    return NextResponse.json({ data: subscription });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

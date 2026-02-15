import { isTopicSlug, type TopicSlug } from "@/config/topics";
import { listIdeas } from "@/lib/repos/ideas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  topic: z.string().optional().refine((v) => !v || isTopicSlug(v), { message: "Invalid topic" }),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      topic: searchParams.get("topic") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid query", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const { topic, limit, offset } = parsed.data;
    const result = await listIdeas({
      topic: topic as TopicSlug | undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

import mockPosts from "@/data/mock-reddit.json";
import { generateIdeasFromMock } from "@/lib/llm/generate-from-mock";
import { insertIdeasWithAdmin } from "@/lib/repos/ideas";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(): Promise<NextResponse> {
  try {
    const ideas = await generateIdeasFromMock(
      mockPosts as Parameters<typeof generateIdeasFromMock>[0]
    );
    if (ideas.length > 0) {
      const admin = createAdminClient();
      await insertIdeasWithAdmin(admin, ideas);
    }
    return NextResponse.json({
      data: { inserted: ideas.length },
      meta: { message: `Inserted ${ideas.length} idea(s)` },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "GENERATION_FAILED", message } },
      { status: 500 }
    );
  }
}

import type { ProductIdea } from "@/types/idea";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? "digest@productidea.local";
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface SendDigestParams {
  to: string;
  ideas: readonly ProductIdea[];
  unsubscribeToken: string;
}

export async function sendDigest(params: SendDigestParams): Promise<{ id?: string; error?: string }> {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(resendApiKey);
  const unsubscribeUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Product Idea Digest</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 1rem;">
  <h1 style="font-size: 1.25rem;">Product Idea Digest</h1>
  <p>Here are your latest product ideas:</p>
  <ul style="list-style: none; padding: 0;">
    ${params.ideas
      .map(
        (i) => `
    <li style="border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
      <strong>${escapeHtml(i.title)}</strong> — Score: ${i.score}/100<br>
      <span style="color: #64748b;">${escapeHtml(i.pitch)}</span><br>
      <a href="${escapeHtml(i.source_url)}" style="color: #0f172a;">r/${escapeHtml(i.source_subreddit)}</a>
    </li>`
      )
      .join("")}
  </ul>
  <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #64748b;">
    <a href="${unsubscribeUrl}">Unsubscribe</a> from this digest.
  </p>
</body>
</html>
`.trim();

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: params.to,
    subject: "Product Idea Digest",
    html,
  });

  if (error) {
    return { error: error.message };
  }
  return { id: data?.id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

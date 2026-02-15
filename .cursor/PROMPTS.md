# Key prompts (context and outcome)

1. **Idea generation system prompt** (`config/prompts.ts` — `IDEA_GENERATION_SYSTEM`)  
   Context: Defines the LLM as a product strategist that turns Reddit-style text into structured product ideas.  
   Outcome: Model returns JSON array with `title`, `pitch`, `pain_insight`, `target_audience`, `score` (0–100).

2. **Idea generation user prompt** (`config/prompts.ts` — `IDEA_GENERATION_USER(rawText)`)  
   Context: Injects raw Reddit post/discussion text (truncated to 6000 chars) and instructs valid JSON only, no markdown.  
   Outcome: Ensures parseable, typed output for `lib/llm/idea-service.ts`.

3. **Product idea extraction** (implicit in system + user prompts)  
   Context: User prompt asks for 1–3 ideas per input; system defines fields and score meaning (pain, willingness to pay, competition, TAM).  
   Outcome: Consistent DTO shape for DB insert and API response.

4. **Email digest subject/body** (`lib/email/resend.ts` — `sendDigest`)  
   Context: Builds HTML email with list of ideas (title, pitch, score, source link) and unsubscribe link.  
   Outcome: Digest email with correct unsubscribe URL and no sensitive data in body.

5. **Unsubscribe page copy** (`app/unsubscribe/page.tsx`)  
   Context: Public page for token-based unsubscribe; explains missing token when `token` is absent.  
   Outcome: Clear UX for “You’re unsubscribed” and error states.

6. **Landing hero** (`app/(marketing)/page.tsx`)  
   Context: One-line value prop and subhead for “Reddit → product ideas” flow.  
   Outcome: Clear CTA to sign up / get started.

7. **Recommendations feed empty state** (`components/ideas-feed.tsx`)  
   Context: When no ideas exist, suggest running the idea generator.  
   Outcome: User knows how to populate the feed.

8. **Subscription form validation** (`app/api/subscribe/route.ts` — zod schema)  
   Context: Validates `email` and `topic_filters` (at least one topic, valid slugs).  
   Outcome: Only valid subscriptions are stored; invalid topics rejected.

9. **Dashboard layout nav** (`app/(dashboard)/layout.tsx`)  
   Context: Shows Feed, Subscriptions, user email, Log out.  
   Outcome: Consistent navigation for authenticated users.

10. **LLM config** (`config/prompts.ts` — `LLM_CONFIG`)  
    Context: Model name from env or default `gpt-4o-mini`, temperature 0.4, max tokens 1500.  
    Outcome: Central place to tune generation behavior.

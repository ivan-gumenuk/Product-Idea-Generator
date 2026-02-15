import Link from "next/link";
import { UnsubscribeAction } from "@/components/unsubscribe-action";

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Unsubscribe</h1>
        {token ? (
          <>
            <p className="text-slate-600">
              Click below to stop receiving product idea digests.
            </p>
            <UnsubscribeAction token={token} />
          </>
        ) : (
          <>
            <p className="text-slate-600">
              Missing unsubscribe token. Use the link from your digest email.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Go home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

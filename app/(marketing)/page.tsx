import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-semibold text-slate-800">Product Idea Generator</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 text-sm"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <section className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Turn Reddit discussions into product ideas
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            We track popular subreddits where people share problems, extract
            signals, and score product opportunities so you can focus on
            building.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-slate-900 text-white px-6 py-3 text-base font-medium hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </section>

        <section className="mt-24 max-w-4xl mx-auto w-full">
          <h2 className="text-center text-xl font-semibold text-slate-800 mb-8">
            Why use Product Idea Generator
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <li className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="font-medium text-slate-900">Curated signal</h3>
              <p className="mt-1 text-sm text-slate-600">
                Fresh product ideas from real discussions, not generic lists.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="font-medium text-slate-900">Scored opportunities</h3>
              <p className="mt-1 text-sm text-slate-600">
                Each idea comes with a 0–100 prospectiveness score.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="font-medium text-slate-900">Weekly digest</h3>
              <p className="mt-1 text-sm text-slate-600">
                Subscribe by topic and get the best ideas in your inbox.
              </p>
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Product Idea Generator — Reddit-powered SaaS ideas
      </footer>
    </div>
  );
}

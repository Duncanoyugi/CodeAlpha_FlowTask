import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Layout,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Zap,
  Users,
} from 'lucide-react';

/**
 * TaskFlow Landing Page (public marketing home)
 *
 * Requirements implemented:
 * - Single file component
 * - Tailwind + TypeScript + lucide-react icons
 * - Palette: slate & steel + only sky-500 accent (sparingly as specified)
 * - Geist typography loaded via index.html and applied here
 * - Static confident layout (no scroll animations)
 */
const HomePage = () => {
  const year = new Date().getFullYear();

  const KanbanCard = ({
    tone,
    title,
  }: {
    tone: 'sky' | 'rose' | 'amber' | 'emerald';
    title: string;
  }) => {
    const toneChip =
      tone === 'sky'
        ? { bg: 'bg-sky-500/20', fg: 'text-sky-300' }
        : tone === 'rose'
          ? { bg: 'bg-rose-500/20', fg: 'text-rose-300' }
          : tone === 'amber'
            ? { bg: 'bg-amber-500/20', fg: 'text-amber-300' }
            : { bg: 'bg-emerald-500/20', fg: 'text-emerald-300' };

    return (
      <div className="rounded-xl bg-slate-700/70 border border-slate-600/60 px-3 py-2">
        <div className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs ${toneChip.bg} ${toneChip.fg} border border-slate-500/40`}>
          {tone === 'sky' ? 'Backend' : tone === 'rose' ? 'Bug' : tone === 'amber' ? 'Ops' : 'QA'}
        </div>
        <div className="mt-2 text-sm text-slate-100/90 font-medium leading-snug">{title}</div>
      </div>
    );
  };

  const Avatar = ({
    tone,
    initials,
    ring = false,
  }: {
    tone: 'rose' | 'amber' | 'sky' | 'emerald';
    initials: string;
    ring?: boolean;
  }) => {
    const bg =
      tone === 'rose'
        ? 'bg-rose-500/25 text-rose-200'
        : tone === 'amber'
          ? 'bg-amber-500/25 text-amber-200'
          : tone === 'sky'
            ? 'bg-sky-500/25 text-sky-200'
            : 'bg-emerald-500/25 text-emerald-200';

    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${
          ring ? 'border-slate-900 bg-slate-900' : 'border-slate-800'
        } ${bg}`}
        aria-hidden
      >
        {initials}
      </div>
    );
  };

  return (
    <div
      style={{ fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif" }}
      className="min-h-screen bg-slate-50"
    >
      {/* Sticky top nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-slate-50/70 border-b border-slate-200/80">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 select-none"
            aria-label="TaskFlow home"
          >
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-none">
              <Layout className="h-4 w-4" />
            </div>
            <div className="text-slate-900 font-semibold tracking-[-0.02em]">TaskFlow</div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/#features" className="text-slate-600 hover:text-slate-900">
              Features
            </Link>
            <Link to="/#boards" className="text-slate-600 hover:text-slate-900">
              Boards
            </Link>
            <Link to="/#pricing" className="text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link to="/register" className="inline-flex">
              <span className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-4 py-2 shadow-sm hover:bg-slate-800 transition-colors">
                Get started
                <ArrowRight className="h-4 w-4 ml-2" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          {/* dotted-grid backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(100,116,139,0.35) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              WebkitMaskImage:
                'radial-gradient(closest-side, rgba(0,0,0,1), rgba(0,0,0,0))',
              maskImage:
                'radial-gradient(closest-side, rgba(0,0,0,1), rgba(0,0,0,0))',
              WebkitMaskPosition: '50% 40%',
              maskPosition: '50% 40%',
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50/80 border border-slate-200 px-4 py-2">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-slate-600">
                  <span className="text-sky-500 font-medium">New</span> — Real-time collaborative boards
                </span>
              </div>

              <h1 className="mt-6 text-7xl leading-[1.05] font-semibold tracking-[-0.04em] text-slate-900">
                Where teams turn{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">chaos</span>
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-1 h-10 bg-sky-200/70 rounded-2xl"
                  />
                </span>{' '}
                into shipped work.
              </h1>

              <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
                TaskFlow helps teams plan, track, and ship with Trello-like cards and Linear-like polish—
                with real-time collaboration built in.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                <Link to="/register" className="w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-5 py-3 shadow-sm hover:bg-slate-800 transition-colors">
                    Get started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </span>
                </Link>
                <Link to="/#boards" className="w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-900 px-5 py-3 shadow-none hover:bg-slate-50 transition-colors">
                    See boards
                  </span>
                </Link>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Free for up to 10 users</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>No credit card</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>SSO ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-6 auto-rows-[160px] gap-4">
            {/* Tile 1 — Live kanban board */}
            <div
              id="boards"
              className="col-span-4 row-span-3 bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-none"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-300">Sprint 24 · Engineering</div>
                  <div className="mt-1 text-sm font-semibold text-slate-100">Live board preview</div>
                </div>
                <div className="flex -space-x-2">
                  <Avatar tone="rose" initials="AR" ring />
                  <Avatar tone="amber" initials="BD" ring />
                  <Avatar tone="sky" initials="CK" ring />
                  <Avatar tone="emerald" initials="EZ" ring />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[{
                  label: 'To do',
                  count: 6,
                }, {
                  label: 'In progress',
                  count: 3,
                }, {
                  label: 'Done',
                  count: 9,
                }].map((col, idx) => {
                  const tone = idx === 0 ? 'rose' : idx === 1 ? 'sky' : 'emerald';
                  return (
                    <div key={col.label} className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-200">{col.label}</div>
                        <div
                          className={`text-[11px] rounded-lg px-2 py-0.5 ${
                            tone === 'sky'
                              ? 'bg-sky-500/20 text-sky-300'
                              : tone === 'rose'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                          } border border-slate-600/60`}
                        >
                          {col.count}
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        {idx === 0 && (
                          <>
                            <KanbanCard tone="rose" title="Migrate auth service" />
                            <KanbanCard tone="amber" title="Billing webhooks v2" />
                          </>
                        )}
                        {idx === 1 && (
                          <>
                            <KanbanCard tone="sky" title="Dashboard charts" />
                            <KanbanCard tone="amber" title="Queue retries" />
                            <KanbanCard tone="rose" title="Polish empty states" />
                          </>
                        )}
                        {idx === 2 && (
                          <>
                            <KanbanCard tone="emerald" title="Release checklist" />
                            <KanbanCard tone="emerald" title="Audit permissions" />
                            <KanbanCard tone="sky" title="Export CSV" />
                            <KanbanCard tone="amber" title="Roadmap sync" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tile 2 — Team velocity */}
            <div className="col-span-2 row-span-2 bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">Throughput</div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Team velocity
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-semibold tracking-[-0.03em] text-slate-900">+38%</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-600">Throughput vs. last quarter</div>
              {/* sparkline */}
              <div className="mt-3 flex items-center justify-between">
                <svg
                  width="140"
                  height="44"
                  viewBox="0 0 140 44"
                  className="block"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="tf-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M2 34 C 18 30, 26 12, 38 18 C 50 24, 60 10, 72 14 C 84 18, 96 8, 108 12 C 120 16, 128 10, 138 6"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeOpacity="0.95"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 34 C 18 30, 26 12, 38 18 C 50 24, 60 10, 72 14 C 84 18, 96 8, 108 12 C 120 16, 128 10, 138 6 L 138 44 L 2 44 Z"
                    fill="url(#tf-sky)"
                  />
                </svg>
                <div className="text-xs text-slate-500">Last 30 days</div>
              </div>
            </div>

            {/* Tile 3 — Real-time */}
            <div className="col-span-2 row-span-1 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-4 border border-sky-300/40">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-sky-100/90">Live collaboration</div>
                  <div className="mt-1 text-sm font-semibold text-white">12 teammates editing now</div>
                </div>
                <Users className="h-5 w-5 text-white/40" />
              </div>
            </div>

            {/* Tile 4 — Automations */}
            <div className="col-span-2 row-span-2 bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Automations that just work</div>
                  <div className="mt-1 text-sm text-slate-600">Move cards, assign owners, and notify the right people.</div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/#pricing"
                  className="text-sm text-slate-900 hover:text-slate-700 font-medium"
                >
                  Browse recipes →
                </Link>
              </div>
            </div>

            {/* Tile 5 — Role-based access */}
            <div className="col-span-2 row-span-2 bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Role-based access</div>
                  <div className="mt-1 text-sm text-slate-600">Fine-grained permissions for teams and guests.</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  'Owner',
                  'Admin',
                  'Member',
                  'Guest',
                ].map((r, i) => (
                  <div
                    key={r}
                    className={`rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-100 border border-slate-200 ${i === 0 ? 'shadow-none' : ''}`}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Tile 6 — Insights */}
            <div className="col-span-2 row-span-2 bg-slate-100 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-slate-900" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Insights, not dashboards</div>
                      <div className="mt-1 text-sm text-slate-600">Know where work is stuck—before it ships late.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* mini 7-bar */}
              <div className="absolute" />
              <div className="mt-6 flex items-end justify-between h-24 pr-2">
                {[12, 26, 20, 34, 28, 44, 38].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-3 rounded-lg bg-slate-300"
                    style={{ height: `${h}px` }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>

            {/* Tile 7 — Async comments */}
            <div className="col-span-2 row-span-2 bg-white rounded-2xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-slate-900" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Async by default</div>
                  <div className="mt-1 text-sm text-slate-600">Comments stay searchable and decision-ready.</div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-sm font-semibold text-rose-600">
                  JM
                </div>
                <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  Pushed the API fix — ready for review.
                </div>
              </div>
            </div>

            {/* Tile 8 — Estimates */}
            <div className="col-span-2 row-span-2 bg-slate-900 rounded-2xl p-4 border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white/90" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Estimates that age well</div>
                  <div className="mt-1 text-sm text-slate-400">Predict delivery with lightweight calibration.</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm">
                <div className="inline-flex items-center gap-2 text-emerald-200/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden />
                  <span className="text-emerald-400 font-medium">Sprint accuracy — 94%</span>
                </div>
                <div className="text-slate-400 text-xs">Rolling</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section
          id="pricing"
          className="relative bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-auto max-w-7xl overflow-hidden"
        >
          {/* radial glows */}
          <div
            aria-hidden
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-sky-500/20 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-sky-500/15 blur-2xl"
          />

          <div className="relative py-20 px-6 sm:px-10">
            <div className="max-w-3xl">
              <h2 className="text-4xl tracking-[-0.03em] font-semibold leading-[1.15]">
                Your team's next sprint / starts cleaner.
              </h2>
              <p className="mt-4 text-slate-300">
                Import from Trello, Jira, or Asana—then collaborate in real time with cards that feel native.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-6 py-3 shadow-sm hover:bg-slate-100 transition-colors">
                    Get started
                  </span>
                </Link>
                <Link to="/#features" className="w-full sm:w-auto">
                  <span className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white px-6 py-3 shadow-none hover:bg-white/15 transition-colors">
                    Talk to sales
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* anchor targets for footer links */}
          <div id="privacy" className="sr-only" aria-hidden />
          <div id="terms" className="sr-only" aria-hidden />
          <div id="contact" className="sr-only" aria-hidden />
          <div className="border-t border-slate-200 pt-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Layout className="h-4 w-4" />
              </div>
              <div className="text-sm text-slate-600">© {year} TaskFlow</div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/#privacy" className="text-slate-600 hover:text-slate-900">
                Privacy
              </Link>
              <Link to="/#terms" className="text-slate-600 hover:text-slate-900">
                Terms
              </Link>
              <Link to="/#contact" className="text-slate-600 hover:text-slate-900">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;


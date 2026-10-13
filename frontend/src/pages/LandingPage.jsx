import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession, homeForSession, readStoredArray } from '../auth/auth.js';

/** Format a post date for the public preview.
 * @param {string} value ISO date string.
 * @returns {string} Human-readable date or an empty string for invalid input.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render the public WriteSpace introduction and latest local posts.
 * @returns {JSX.Element} Landing page.
 */
export default function LandingPage() {
  const session = getSession();
  const posts = readStoredArray('writespace_posts')
    .filter((post) => post && typeof post.title === 'string')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar session={session} />
      <main>
        <section className="relative isolate flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-pink-600 text-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25">
            <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-pink-300 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-300 blur-3xl" />
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-20">
            <div className="animate-[fade-up_650ms_ease-out_both]">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">A little room for your ideas</p>
              <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Your thoughts. Your space.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">Your thoughts. Your space. Beautifully simple.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="rounded-full bg-white px-7 py-3.5 text-center font-bold text-indigo-800 shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98]" to={session ? '/blogs' : '/login'}>Start Reading</Link>
                <Link className="rounded-full border border-white/70 bg-white/10 px-7 py-3.5 text-center font-bold text-white transition-colors hover:bg-white/20" to="/register">Get Started Free</Link>
              </div>
            </div>
            <div aria-label="A preview of a writing space" className="relative mx-auto w-full max-w-md animate-[float_6s_ease-in-out_infinite] rounded-3xl border border-white/40 bg-white p-6 text-slate-800 shadow-2xl shadow-indigo-950/30 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-display text-sm font-bold text-indigo-700">WriteSpace</span>
                <span className="text-xs text-slate-400">A quiet place to write</span>
              </div>
              <div className="py-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">A new page</p>
                <h2 className="mt-3 font-display text-2xl font-bold">Small ideas, given room</h2>
                <p className="mt-4 leading-relaxed text-slate-500">Start with a sentence. Keep going for as long as you like.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>Plain text, no distractions</span>
                <span aria-hidden="true" className="text-indigo-600">✦</span>
              </div>
            </div>
          </div>
        </section>
        <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Made for the words</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl" id="features-heading">A simpler way to share what you think.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl bg-indigo-50 p-6 sm:p-7">
              <span aria-hidden="true" className="text-2xl text-indigo-700">✎</span>
              <h3 className="mt-5 font-display text-xl font-bold">Write Freely</h3>
              <p className="mt-2 leading-relaxed text-slate-600">Plain-text writing, with nothing between you and the page.</p>
            </article>
            <article className="rounded-2xl bg-violet-50 p-6 sm:p-7 md:translate-y-5">
              <span aria-hidden="true" className="text-2xl text-violet-700">⌂</span>
              <h3 className="mt-5 font-display text-xl font-bold">Private &amp; Local</h3>
              <p className="mt-2 leading-relaxed text-slate-600">Your posts and account stay in this browser.</p>
            </article>
            <article className="rounded-2xl bg-rose-50 p-6 sm:p-7">
              <span aria-hidden="true" className="text-2xl text-rose-700">↗</span>
              <h3 className="mt-5 font-display text-xl font-bold">Instant &amp; Fast</h3>
              <p className="mt-2 leading-relaxed text-slate-600">No server to wait for. Open the page and get writing.</p>
            </article>
          </div>
        </section>
        <section aria-labelledby="latest-heading" className="bg-slate-50 px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Fresh writing</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl" id="latest-heading">Latest from the Blog</h2>
              </div>
              {session && <Link className="font-semibold text-indigo-700 hover:text-indigo-900" to="/blogs">All Blogs <span aria-hidden="true">→</span></Link>}
            </div>
            {posts.length ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {posts.map((post) => (
                  <Link className="group rounded-2xl bg-white p-6 shadow-card transition-transform hover:-translate-y-1" key={post.id} to={session ? `/blog/${post.id}` : '/login'}>
                    <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                    <h3 className="mt-3 font-display text-xl font-bold group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-600">{String(post.content || '').slice(0, 120)}</p>
                    <span className="mt-5 inline-block text-sm font-semibold text-indigo-700">Read post <span aria-hidden="true">→</span></span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">No posts yet — check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 px-6 py-10 text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-display text-lg font-bold text-white" to="/">WriteSpace</Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to={session ? '/blogs' : '/login'}>All Blogs</Link>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/register">Register</Link>
          </nav>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}

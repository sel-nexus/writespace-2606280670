import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession } from '../auth/auth.js';
import { getPosts, sortPostsNewestFirst, canManagePost } from '../blog/posts.js';

const accents = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/** Format a post date using the product's month-day-year format.
 * @param {string} value ISO date string.
 * @returns {string} Formatted date or a safe fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render the authenticated newest-first post collection.
 * @returns {JSX.Element} Blog list page.
 */
export default function BlogListPage() {
  const session = getSession();
  const posts = sortPostsNewestFirst(getPosts());
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Community writing</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">All Blogs</h1>
            <p className="mt-3 max-w-xl text-slate-600">Read what people are thinking, or add a page of your own.</p>
          </div>
          <Link className="rounded-full bg-indigo-700 px-6 py-3 text-center font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-indigo-800" to="/write">Write a Post</Link>
        </div>
        {posts.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article className={`flex min-h-64 flex-col rounded-2xl border-t-4 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-card ${accents[index % accents.length]}`} key={post.id}>
                <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                <Link className="mt-3 font-display text-xl font-bold text-slate-900 hover:text-indigo-700" to={`/blog/${post.id}`}>{post.title}</Link>
                <p className="mt-3 flex-1 leading-relaxed text-slate-600">{post.content.slice(0, 120)}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Avatar role={post.authorId === 'writespace-default-admin' ? 'admin' : 'user'} size="sm" />
                    <span className="text-sm font-medium text-slate-700">{post.authorName}</span>
                  </div>
                  {canManagePost(session, post) && <Link aria-label={`Edit ${post.title}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="font-display text-2xl font-bold">No blogs yet. Be the first to write one!</h2>
            <p className="mt-3 text-slate-600">Your first post can start with a single sentence.</p>
            <Link className="mt-6 inline-flex rounded-full bg-indigo-700 px-6 py-3 font-bold text-white hover:bg-indigo-800" to="/write">Write a Post</Link>
          </section>
        )}
      </main>
    </div>
  );
}

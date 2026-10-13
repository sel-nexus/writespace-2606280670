import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession } from '../auth/auth.js';
import { sortPostsNewestFirst, getPosts, deletePost } from '../blog/posts.js';
import { getUserTotals } from '../admin/users.js';

const statStyles = [
  'bg-indigo-50 text-indigo-800',
  'bg-violet-50 text-violet-800',
  'bg-pink-50 text-pink-800',
  'bg-teal-50 text-teal-800',
];

/** Format a date for dashboard activity rows.
 * @param {string} value ISO date string.
 * @returns {string} Formatted date or a safe fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render the administrator dashboard with local activity summaries.
 * @returns {JSX.Element} Admin dashboard.
 */
export default function AdminPage() {
  const session = getSession();
  const navigate = useNavigate();
  const posts = sortPostsNewestFirst(getPosts());
  const totals = getUserTotals();
  const stats = [
    { label: 'Total Posts', value: posts.length },
    { label: 'Total Users', value: totals.total },
    { label: 'Total Admins', value: totals.admins },
    { label: 'Total users', value: totals.users },
  ];

  function handleDelete(post) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    if (deletePost(post.id, session).ok) navigate('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar session={session} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-9 text-white shadow-lg sm:px-10 sm:py-11">
          <p className="text-sm font-semibold text-white/80">WriteSpace administration</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Good to see you, {session?.displayName || 'Admin'}.</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-white/85">A clear view of the writing and accounts in this browser.</p>
        </section>
        <section aria-label="Site totals" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <article className={`rounded-2xl p-5 sm:p-6 ${statStyles[index]}`} key={stat.label}>
              <p className="text-sm font-semibold">{stat.label}</p>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">{stat.value}</p>
            </article>
          ))}
        </section>
        <section aria-label="Quick actions" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-full bg-indigo-700 px-6 py-3 text-center font-bold text-white hover:bg-indigo-800" to="/write">Write New Post</Link>
          <Link className="rounded-full border border-indigo-200 bg-white px-6 py-3 text-center font-bold text-indigo-800 hover:bg-indigo-50" to="/users">Manage Users</Link>
        </section>
        <section aria-labelledby="recent-posts-heading" className="mt-12 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Content overview</p>
              <h2 className="mt-2 font-display text-2xl font-bold" id="recent-posts-heading">Recent posts</h2>
            </div>
            <Link className="text-sm font-semibold text-indigo-700 hover:underline" to="/blogs">All Blogs</Link>
          </div>
          {posts.length ? (
            <div className="mt-6 divide-y divide-slate-100">
              {posts.slice(0, 5).map((post) => (
                <article className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between" key={post.id}>
                  <div className="flex items-center gap-3">
                    <Avatar role={post.authorId === 'writespace-default-admin' ? 'admin' : 'user'} size="sm" />
                    <div>
                      <Link className="font-semibold text-slate-900 hover:text-indigo-700" to={`/blog/${post.id}`}>{post.title}</Link>
                      <p className="mt-1 text-sm text-slate-500">By {post.authorName} · {formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-11 sm:pl-0">
                    <Link className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" to={`/edit/${post.id}`}>Edit</Link>
                    <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(post)} type="button">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 px-5 py-8 text-center text-slate-600">No posts yet. Write the first one to get started.</p>
          )}
        </section>
      </main>
    </div>
  );
}

import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Avatar from '../components/Avatar.jsx';
import { getSession } from '../auth/auth.js';
import { canManagePost, deletePost, getPostById } from '../blog/posts.js';

/** Format a post date for the reader view.
 * @param {string} value ISO date string.
 * @returns {string} Formatted date or a safe fallback.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/** Render a full post with ownership-aware edit and delete actions.
 * @returns {JSX.Element} Blog detail page.
 */
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const post = getPostById(id);
  const canManage = canManagePost(session, post);

  function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const result = deletePost(id, session);
    if (result.ok) navigate('/blogs', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {!post ? (
          <section className="rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
            <h1 className="font-display text-3xl font-bold">Post not found</h1>
            <p className="mt-3 text-slate-600">This post may have been removed or the link may be incorrect.</p>
            <Link className="mt-6 inline-flex font-semibold text-indigo-700 hover:underline" to="/blogs">Back to All Posts</Link>
          </section>
        ) : (
          <article className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
            <Link className="text-sm font-semibold text-indigo-700 hover:underline" to="/blogs">← Back to All Posts</Link>
            <h1 className="mt-7 font-display text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <Avatar role={post.authorId === 'writespace-default-admin' ? 'admin' : 'user'} />
                <div>
                  <p className="font-semibold text-slate-800">{post.authorName}</p>
                  <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <Link className="rounded-full border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50" to={`/edit/${post.id}`}>Edit</Link>
                  <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={handleDelete} type="button">Delete</button>
                </div>
              )}
            </div>
            <div className="whitespace-pre-wrap break-words py-8 text-lg leading-8 text-slate-700">{post.content}</div>
            {!canManage && <Link className="inline-flex font-semibold text-indigo-700 hover:underline" to="/blogs">Back to All Posts</Link>}
          </article>
        )}
      </main>
    </div>
  );
}

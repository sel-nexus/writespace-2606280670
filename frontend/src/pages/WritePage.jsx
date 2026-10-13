import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { getSession } from '../auth/auth.js';
import { canManagePost, createPost, getPostById, updatePost } from '../blog/posts.js';

/** Render the create/edit post form with ownership enforcement.
 * @returns {JSX.Element} Post editor page.
 */
export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const existing = id ? getPostById(id) : null;
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [errors, setErrors] = useState({});
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    setTitle(existing?.title || '');
    setContent(existing?.content || '');
    setErrors({});
    setStorageError('');
  }, [id, existing?.title, existing?.content]);

  const unauthorized = Boolean(id && (!existing || !canManagePost(session, existing)));

  useEffect(() => {
    if (unauthorized) navigate('/blogs', { replace: true });
  }, [navigate, unauthorized]);

  if (unauthorized) return null;

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = 'Content is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const result = existing
      ? updatePost(id, { title, content }, session)
      : createPost({ title, content }, session);
    if (!result.ok) {
      setStorageError(result.error);
      return;
    }
    navigate(`/blog/${result.post.id}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar session={session} />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <Link className="text-sm font-semibold text-indigo-700 hover:underline" to="/blogs">← Back to All Posts</Link>
          <h1 className="mt-5 font-display text-4xl font-bold">{existing ? 'Edit your post' : 'Write a new post'}</h1>
          <p className="mt-2 text-slate-600">A clear title and your own words are all you need.</p>
        </div>
        <form className="rounded-3xl bg-white p-6 shadow-card sm:p-9" noValidate onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="post-title">Title</label>
            <input aria-describedby={errors.title ? 'title-error' : undefined} aria-invalid={Boolean(errors.title)} aria-required="true" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="post-title" onChange={(event) => setTitle(event.target.value)} value={title} />
            {errors.title && <p className="mt-1 text-sm text-rose-700" id="title-error" role="alert">{errors.title}</p>}
          </div>
          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="post-content">Content</label>
            <textarea aria-describedby={errors.content ? 'content-error' : undefined} aria-invalid={Boolean(errors.content)} aria-required="true" className="min-h-64 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 leading-relaxed text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" id="post-content" onChange={(event) => setContent(event.target.value)} value={content} />
            {errors.content && <p className="mt-1 text-sm text-rose-700" id="content-error" role="alert">{errors.content}</p>}
            <p className="mt-2 text-right text-sm text-slate-500">{content.length} characters</p>
          </div>
          {storageError && <p className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{storageError}</p>}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link className="rounded-full px-6 py-3 text-center font-semibold text-slate-600 hover:bg-slate-100" to={existing ? `/blog/${existing.id}` : '/blogs'}>Cancel</Link>
            <button className="rounded-full bg-indigo-700 px-7 py-3 font-bold text-white shadow-sm hover:bg-indigo-800" type="submit">{existing ? 'Save Changes' : 'Publish Post'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}

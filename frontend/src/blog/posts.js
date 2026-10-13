import { readStoredArray, writeStoredValue } from '../auth/auth.js';

export const POSTS_KEY = 'writespace_posts';

/** Read valid posts from local storage, returning an empty list on storage errors.
 * @returns {Array<object>} Valid post records.
 */
export function getPosts() {
  return readStoredArray(POSTS_KEY).filter(
    (post) => post && typeof post.id === 'string' && typeof post.title === 'string' && typeof post.content === 'string',
  );
}

/** Sort posts newest-first, treating invalid dates as older than valid dates.
 * @param {Array<object>} posts Post records.
 * @returns {Array<object>} Sorted copy of the posts.
 */
export function sortPostsNewestFirst(posts) {
  return [...posts].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
  });
}

/** Find a post by its stable identifier.
 * @param {string} id Post identifier.
 * @returns {object|null} Matching post or null.
 */
export function getPostById(id) {
  return getPosts().find((post) => post.id === id) || null;
}

/** Create a post using the current session identity.
 * @param {{title: string, content: string}} input Post fields.
 * @param {object|null} session Current user session.
 * @returns {{ok: boolean, post?: object, error?: string}} Creation result.
 */
export function createPost(input, session) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const content = typeof input?.content === 'string' ? input.content.trim() : '';
  if (!title || !content) return { ok: false, error: 'Title and content are required.' };
  if (!session || typeof session.userId !== 'string' || typeof session.displayName !== 'string') {
    return { ok: false, error: 'Sign in before creating a post.' };
  }

  const post = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
    authorId: session.userId,
    authorName: session.displayName,
  };
  if (!writeStoredValue(POSTS_KEY, [...getPosts(), post])) {
    return { ok: false, error: 'Browser storage is unavailable. Your post was not saved.' };
  }
  return { ok: true, post };
}

/** Update a post when the session owns it or has the administrator role.
 * @param {string} id Post identifier.
 * @param {{title: string, content: string}} input Updated fields.
 * @param {object|null} session Current user session.
 * @returns {{ok: boolean, post?: object, error?: string}} Update result.
 */
export function updatePost(id, input, session) {
  const title = typeof input?.title === 'string' ? input.title.trim() : '';
  const content = typeof input?.content === 'string' ? input.content.trim() : '';
  if (!title || !content) return { ok: false, error: 'Title and content are required.' };
  const posts = getPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return { ok: false, error: 'Post not found.' };
  const current = posts[index];
  if (!session || (session.role !== 'admin' && current.authorId !== session.userId)) {
    return { ok: false, error: 'You do not have permission to edit this post.' };
  }

  const updated = { ...current, title, content };
  posts[index] = updated;
  if (!writeStoredValue(POSTS_KEY, posts)) return { ok: false, error: 'Browser storage is unavailable. Your changes were not saved.' };
  return { ok: true, post: updated };
}

/** Delete a post when the session owns it or has the administrator role.
 * @param {string} id Post identifier.
 * @param {object|null} session Current user session.
 * @returns {{ok: boolean, error?: string}} Deletion result.
 */
export function deletePost(id, session) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === id);
  if (!post) return { ok: false, error: 'Post not found.' };
  if (!session || (session.role !== 'admin' && post.authorId !== session.userId)) {
    return { ok: false, error: 'You do not have permission to delete this post.' };
  }
  if (!writeStoredValue(POSTS_KEY, posts.filter((item) => item.id !== id))) {
    return { ok: false, error: 'Browser storage is unavailable. The post was not deleted.' };
  }
  return { ok: true };
}

/** Check whether a session may manage a post.
 * @param {object|null} session Current session.
 * @param {object} post Post record.
 * @returns {boolean} Whether the session may edit or delete the post.
 */
export function canManagePost(session, post) {
  return Boolean(session && post && (session.role === 'admin' || session.userId === post.authorId));
}

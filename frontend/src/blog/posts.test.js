import { beforeEach, describe, expect, it, vi } from 'vitest';
import { canManagePost, createPost, deletePost, getPostById, getPosts, POSTS_KEY, sortPostsNewestFirst, updatePost } from './posts.js';

const writer = { userId: 'writer-1', displayName: 'Rae Writer', role: 'user' };
const otherWriter = { userId: 'writer-2', displayName: 'Kai Reader', role: 'user' };
const admin = { userId: 'admin-1', displayName: 'Admin', role: 'admin' };

beforeEach(() => {
  window.localStorage.clear();
});

describe('local post operations', () => {
  it('creates a post with generated identity, timestamp, and session author', () => {
    const result = createPost({ title: '  First page  ', content: '  A thought.  ' }, writer);
    expect(result.ok).toBe(true);
    expect(result.post).toMatchObject({ title: 'First page', content: 'A thought.', authorId: writer.userId, authorName: writer.displayName });
    expect(result.post.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(Number.isNaN(Date.parse(result.post.createdAt))).toBe(false);
    expect(getPostById(result.post.id)).toEqual(result.post);
  });

  it('rejects missing fields and missing sessions without writing data', () => {
    expect(createPost({ title: '', content: 'body' }, writer)).toEqual({ ok: false, error: 'Title and content are required.' });
    expect(createPost({ title: 'Title', content: 'body' }, null).error).toBe('Sign in before creating a post.');
    expect(getPosts()).toEqual([]);
  });

  it('sorts newest first without mutating the original list', () => {
    const posts = [{ id: 'old', createdAt: '2024-01-01' }, { id: 'new', createdAt: '2025-01-01' }];
    expect(sortPostsNewestFirst(posts).map((post) => post.id)).toEqual(['new', 'old']);
    expect(posts[0].id).toBe('old');
  });

  it('updates owned posts and preserves their original author and creation date', () => {
    const created = createPost({ title: 'Draft', content: 'Before' }, writer).post;
    const result = updatePost(created.id, { title: 'Revised', content: 'After' }, writer);
    expect(result.ok).toBe(true);
    expect(result.post).toMatchObject({ title: 'Revised', content: 'After', authorId: writer.userId, createdAt: created.createdAt });
    expect(getPostById(created.id).content).toBe('After');
  });

  it('rejects invalid updates, missing posts, and edits by another user', () => {
    const post = createPost({ title: 'Draft', content: 'Body' }, writer).post;
    expect(updatePost(post.id, { title: '', content: 'Body' }, writer).error).toBe('Title and content are required.');
    expect(updatePost('missing', { title: 'Title', content: 'Body' }, writer).error).toBe('Post not found.');
    expect(updatePost(post.id, { title: 'Title', content: 'Body' }, otherWriter).error).toBe('You do not have permission to edit this post.');
    expect(getPostById(post.id).title).toBe('Draft');
  });

  it('allows admins to update any post', () => {
    const post = createPost({ title: 'Draft', content: 'Body' }, writer).post;
    expect(updatePost(post.id, { title: 'Admin edit', content: 'Updated' }, admin).ok).toBe(true);
    expect(getPostById(post.id).title).toBe('Admin edit');
  });

  it('deletes owned posts and rejects unauthorized or missing deletions', () => {
    const post = createPost({ title: 'Draft', content: 'Body' }, writer).post;
    expect(deletePost(post.id, otherWriter).error).toBe('You do not have permission to delete this post.');
    expect(getPostById(post.id)).not.toBeNull();
    expect(deletePost('missing', writer).error).toBe('Post not found.');
    expect(deletePost(post.id, writer).ok).toBe(true);
    expect(getPostById(post.id)).toBeNull();
  });

  it('allows admins to delete any post', () => {
    const post = createPost({ title: 'Draft', content: 'Body' }, writer).post;
    expect(deletePost(post.id, admin).ok).toBe(true);
    expect(getPosts()).toEqual([]);
  });

  it('filters malformed records and handles corrupt or unavailable storage', () => {
    window.localStorage.setItem(POSTS_KEY, JSON.stringify([{ id: 'valid', title: 'Title', content: 'Body' }, { id: 'bad', title: 4, content: null }]));
    expect(getPosts()).toEqual([{ id: 'valid', title: 'Title', content: 'Body' }]);
    window.localStorage.setItem(POSTS_KEY, '{broken');
    expect(getPosts()).toEqual([]);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(createPost({ title: 'Title', content: 'Body' }, writer).ok).toBe(false);
    setItem.mockRestore();
  });

  it('checks ownership and administrator permissions', () => {
    const post = { authorId: writer.userId };
    expect(canManagePost(writer, post)).toBe(true);
    expect(canManagePost(otherWriter, post)).toBe(false);
    expect(canManagePost(admin, post)).toBe(true);
    expect(canManagePost(null, post)).toBe(false);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPost } from '../blog/posts.js';
import BlogListPage from './BlogListPage.jsx';
import BlogDetailPage from './BlogDetailPage.jsx';
import WritePage from './WritePage.jsx';

const writer = { userId: 'writer-1', username: 'rae', displayName: 'Rae Writer', role: 'user' };
const otherWriter = { userId: 'writer-2', username: 'kai', displayName: 'Kai Reader', role: 'user' };
const admin = { userId: 'admin-1', username: 'admin', displayName: 'Admin', role: 'admin' };

function setSession(session) {
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
}

function renderRoutes(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<BlogListPage />} path="/blogs" />
        <Route element={<BlogDetailPage />} path="/blog/:id" />
        <Route element={<WritePage />} path="/write" />
        <Route element={<WritePage />} path="/edit/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('blog pages', () => {
  it('shows the empty state and a write action', () => {
    setSession(writer);
    renderRoutes('/blogs');
    expect(screen.getByText('No blogs yet. Be the first to write one!')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Write a Post' }).every((link) => link.getAttribute('href') === '/write')).toBe(true);
  });

  it('renders newest-first cards with a 120-character excerpt and author', () => {
    setSession(writer);
    window.localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'old', title: 'Older story', content: 'old body', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'writer-2', authorName: 'Kai Reader' },
      { id: 'new', title: 'Newer story', content: 'x'.repeat(150), createdAt: '2025-01-01T00:00:00.000Z', authorId: writer.userId, authorName: writer.displayName },
    ]));
    renderRoutes('/blogs');
    const headings = screen.getAllByRole('link').map((link) => link.textContent);
    expect(headings.indexOf('Newer story')).toBeLessThan(headings.indexOf('Older story'));
    expect(screen.getByText('x'.repeat(120))).toBeInTheDocument();
    expect(screen.getAllByText('Rae Writer')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Edit Newer story' })).toHaveAttribute('href', '/edit/new');
    expect(screen.queryByRole('link', { name: 'Edit Older story' })).not.toBeInTheDocument();
  });

  it('shows full post content and hides edit/delete controls for another user', () => {
    setSession(writer);
    const post = createPost({ title: 'A public thought', content: 'First line\nSecond line' }, otherWriter).post;
    renderRoutes(`/blog/${post.id}`);
    expect(screen.getByRole('heading', { name: 'A public thought' })).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('First line') && text.includes('Second line'))).toBeInTheDocument();
    expect(screen.getByText('Kai Reader')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
  });

  it('shows a missing-post message and back link for an invalid id', () => {
    setSession(writer);
    renderRoutes('/blog/missing');
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to All Posts' })).toHaveAttribute('href', '/blogs');
  });

  it('creates a post with required-field errors and a character counter', () => {
    setSession(writer);
    renderRoutes('/write');
    expect(screen.getByText('0 characters')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Publish Post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
  });

  it('creates and edits a post, persisting the updated content', () => {
    setSession(writer);
    renderRoutes('/write');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My first post' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'A complete thought.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publish Post' }));
    const saved = JSON.parse(window.localStorage.getItem('writespace_posts'))[0];
    expect(saved).toMatchObject({ title: 'My first post', content: 'A complete thought.', authorId: writer.userId });
    render(<MemoryRouter initialEntries={[`/edit/${saved.id}`]}><Routes><Route element={<WritePage />} path="/edit/:id" /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Updated thought.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))[0].content).toBe('Updated thought.');
  });

  it('allows an admin to edit another author post', () => {
    setSession(admin);
    const post = createPost({ title: 'Writer post', content: 'Body' }, otherWriter).post;
    renderRoutes(`/edit/${post.id}`);
    expect(screen.getByLabelText('Title')).toHaveValue('Writer post');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('confirms deletion and removes the post only after confirmation', () => {
    setSession(writer);
    const post = createPost({ title: 'Remove me', content: 'Body' }, writer).post;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderRoutes(`/blog/${post.id}`);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(confirm).toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toHaveLength(1);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toEqual([]);
  });
});

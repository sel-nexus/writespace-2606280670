import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_USER, USERS_KEY } from '../auth/auth.js';
import { createPost } from '../blog/posts.js';
import AdminPage from './AdminPage.jsx';
import UsersPage from './UsersPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

const admin = { userId: ADMIN_USER.userId, username: 'admin', displayName: 'Administrator', role: 'admin' };
const user = { userId: 'user-1', username: 'rae', displayName: 'Rae Writer', role: 'user' };

function setSession(session) {
  window.localStorage.setItem('writespace_session', JSON.stringify(session));
}

function renderAdminRoutes(path) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} path="/admin" />
    <Route element={<ProtectedRoute role="admin"><UsersPage /></ProtectedRoute>} path="/users" />
    <Route element={<p>Login destination</p>} path="/login" />
    <Route element={<p>Blogs destination</p>} path="/blogs" />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('administrator pages', () => {
  it('redirects guests to login and regular users to blogs', () => {
    renderAdminRoutes('/admin');
    expect(screen.getByText('Login destination')).toBeInTheDocument();
    window.localStorage.setItem('writespace_session', JSON.stringify(user));
    renderAdminRoutes('/users');
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
  });

  it('shows dashboard totals, quick actions, and up to five recent posts', () => {
    setSession(admin);
    window.localStorage.setItem(USERS_KEY, JSON.stringify([
      { userId: 'u1', username: 'rae', displayName: 'Rae Writer', role: 'user', createdAt: '2025-01-01' },
      { userId: 'u2', username: 'kai', displayName: 'Kai Reader', role: 'user', createdAt: '2025-01-02' },
    ]));
    for (let index = 0; index < 7; index += 1) {
      createPost({ title: `Post ${index}`, content: 'Body' }, user);
    }
    const posts = JSON.parse(window.localStorage.getItem('writespace_posts'));
    posts.forEach((post, index) => { post.createdAt = new Date(Date.UTC(2025, 0, index + 1)).toISOString(); });
    window.localStorage.setItem('writespace_posts', JSON.stringify(posts));
    renderAdminRoutes('/admin');
    expect(screen.getByRole('heading', { name: 'Good to see you, Administrator.' })).toBeInTheDocument();
    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Admins')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write New Post' })).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: 'Manage Users' })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: 'Post 6' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Post / })).toHaveLength(5);
    expect(screen.queryByRole('link', { name: 'Post 1' })).not.toBeInTheDocument();
  });

  it('shows an empty recent-post state', () => {
    setSession(admin);
    renderAdminRoutes('/admin');
    expect(screen.getByText('No posts yet. Write the first one to get started.')).toBeInTheDocument();
  });

  it('creates a user account and reports duplicate or missing fields', () => {
    setSession(admin);
    renderAdminRoutes('/users');
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Rae Writer' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'rae' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'user' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('status')).toHaveTextContent('Rae Writer was added.');
    expect(screen.getAllByText('Rae Writer').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'RAE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
  });

  it('disables deletion for the default admin and current account', () => {
    setSession(admin);
    renderAdminRoutes('/users');
    expect(screen.getAllByRole('button', { name: 'Default admin cannot be deleted' }).every((button) => button.disabled)).toBe(true);
    expect(screen.getAllByRole('button', { name: 'Default admin cannot be deleted' })[0]).toHaveAttribute('title', 'Default admin cannot be deleted.');
  });

  it('requires confirmation and persists eligible account deletion', () => {
    setSession(admin);
    window.localStorage.setItem(USERS_KEY, JSON.stringify([{ userId: 'u1', username: 'rae', displayName: 'Rae Writer', role: 'user', createdAt: '2025-01-01' }]));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAdminRoutes('/users');
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Rae Writer' })[0]);
    expect(confirm).toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))).toHaveLength(1);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete Rae Writer' })[0]);
    expect(JSON.parse(window.localStorage.getItem(USERS_KEY))).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent("Rae Writer's account was deleted.");
  });
});

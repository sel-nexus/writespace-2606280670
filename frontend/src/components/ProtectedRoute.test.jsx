import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute.jsx';

beforeEach(() => {
  window.localStorage.clear();
});

describe('ProtectedRoute', () => {
  it('passes an authenticated user through to protected content', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', displayName: 'Rae', role: 'user' }));
    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route element={<ProtectedRoute><p>Private posts</p></ProtectedRoute>} path="/blogs" />
          <Route element={<p>Login destination</p>} path="/login" />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Private posts')).toBeInTheDocument();
    expect(screen.queryByText('Login destination')).not.toBeInTheDocument();
  });

  it('redirects an authenticated user without the required role', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', displayName: 'Rae', role: 'user' }));
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute role="admin"><p>Admin area</p></ProtectedRoute>} path="/admin" />
          <Route element={<p>Blogs destination</p>} path="/blogs" />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });
});

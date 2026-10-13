import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { login } from '../auth/auth.js';
import LandingPage from './LandingPage.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Navbar from '../components/Navbar.jsx';

function renderAt(path, element) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route element={element} path="*" /></Routes></MemoryRouter>);
}

describe('public and identity pages', () => {
  it('shows the landing tagline, guest entry links, and empty latest-post state', () => {
    renderAt('/', <LandingPage />);
    expect(screen.getByText('Your thoughts. Your space. Beautifully simple.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Login' }).every((link) => link.getAttribute('href') === '/login')).toBe(true);
    expect(screen.getByRole('link', { name: 'Get Started' })).toHaveAttribute('href', '/register');
    expect(screen.getByText('No posts yet - check back soon!')).toBeInTheDocument();
  });

  it('shows the invalid credential message after a failed login', () => {
    renderAt('/login', <LoginPage />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.');
  });

  it('shows field-level registration errors for missing values', () => {
    renderAt('/register', <RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('redirects guests from protected routes to login', () => {
    render(<MemoryRouter initialEntries={['/blogs']}><Routes><Route element={<ProtectedRoute><p>Private posts</p></ProtectedRoute>} path="/blogs" /><Route element={<p>Login destination</p>} path="/login" /></Routes></MemoryRouter>);
    expect(screen.getByText('Login destination')).toBeInTheDocument();
    expect(screen.queryByText('Private posts')).not.toBeInTheDocument();
  });

  it('redirects a regular user away from admin-only routes', () => {
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', username: 'rae', displayName: 'Rae', role: 'user' }));
    render(<MemoryRouter initialEntries={['/admin']}><Routes><Route element={<ProtectedRoute role="admin"><p>Admin area</p></ProtectedRoute>} path="/admin" /><Route element={<p>Blogs destination</p>} path="/blogs" /></Routes></MemoryRouter>);
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
  });

  it('toggles the mobile navigation and exposes role-specific links', () => {
    login('admin', 'admin');
    renderAt('/', <Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/admin');
  });
});

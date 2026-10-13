import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar.jsx';

describe('Avatar', () => {
  it('renders the administrator fallback glyph and styling', () => {
    render(<Avatar name="Admin User" role="admin" />);
    const avatar = screen.getByLabelText('Admin avatar');
    expect(avatar).toHaveTextContent('♛');
    expect(avatar).toHaveClass('bg-violet-600');
  });

  it('renders the user fallback glyph and styling', () => {
    render(<Avatar name="Rae Writer" role="user" />);
    const avatar = screen.getByLabelText('User avatar');
    expect(avatar).toHaveTextContent('▤');
    expect(avatar).toHaveClass('bg-indigo-500');
  });

  it('uses the default size when the supplied size is invalid', () => {
    render(<Avatar name="Rae Writer" role="user" size="invalid" />);
    expect(screen.getByLabelText('User avatar')).toHaveClass('h-10', 'w-10');
  });
});

import PropTypes from 'prop-types';

/** Render the role-specific WriteSpace avatar mark.
 * @param {{role: string, size?: string, className?: string}} props Avatar properties.
 * @returns {JSX.Element} Accessible avatar mark.
 */
export default function Avatar({ role, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  const isAdmin = role === 'admin';
  return (
    <span
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'} ${sizes[size] || sizes.md} ${className}`}
    >
      {isAdmin ? '♛' : '▤'}
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.string.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
};

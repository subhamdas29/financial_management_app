import clsx from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'red' | 'yellow' | 'gray';
}

export const Badge = ({ label, variant = 'gray' }: BadgeProps) => {
  return (
    <span
      className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', {
        'bg-accent/20 text-accent': variant === 'green',
        'bg-red-500/20 text-red-400': variant === 'red',
        'bg-yellow-500/20 text-yellow-400': variant === 'yellow',
        'bg-dark-500 text-gray-400': variant === 'gray',
      })}
    >
      {label}
    </span>
  );
};
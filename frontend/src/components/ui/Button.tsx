import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2',
        {
          'bg-accent text-black hover:bg-yellow-400': variant === 'primary',
          'bg-dark-600 text-white hover:bg-dark-500': variant === 'secondary',
          'bg-transparent text-white hover:bg-dark-600': variant === 'ghost',
          'bg-red-500/20 text-red-400 hover:bg-red-500/30': variant === 'danger',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className
      )}
      {...props}
    >
      {loading ? <span className="animate-spin inline-block">⟳</span> : children}
    </button>
  );
};
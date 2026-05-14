import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'border border-dark-500 rounded-2xl p-5',
        !className?.includes('bg-') && 'bg-dark-700',
        { 'cursor-pointer hover:border-accent/50 transition-all': onClick },
        className
      )}
    >
      {children}
    </div>
  );
};
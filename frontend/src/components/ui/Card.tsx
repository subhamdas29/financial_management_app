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
        'bg-dark-800 border border-dark-600 rounded-2xl p-5',
        { 'cursor-pointer hover:border-accent/40 transition-colors': onClick },
        className
      )}
    >
      {children}
    </div>
  );
};
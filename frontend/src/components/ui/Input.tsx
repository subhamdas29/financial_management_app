import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-400">{label}</label>
      )}
      <input
        className={clsx(
          'bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-accent transition-colors text-sm',
          { 'border-red-500': error },
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};
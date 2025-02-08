export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 
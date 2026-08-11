export function Loader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#FF5A1F] ${sizeStyles[size]}`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F8F7]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E5E7EB] border-t-[#FF5A1F] mx-auto mb-4" />
        <p className="text-[#5F6B76]">Loading...</p>
      </div>
    </div>
  );
}
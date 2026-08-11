import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = 'No data available', icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[#5F6B76]">
      {icon || <FileX className="h-12 w-12 mb-4 text-[#8A949E]" />}
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
}
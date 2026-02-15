import { ThemeColors } from '../types';

interface LoadingSpinnerProps {
  colors: ThemeColors;
}

export function LoadingSpinner({ colors }: LoadingSpinnerProps) {
  return (
    <div className="flex h-screen items-center justify-center" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
          style={{ borderColor: colors.text }}
        />
        <p>Loading visualization...</p>
      </div>
    </div>
  );
}

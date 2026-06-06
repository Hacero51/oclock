// components/ui/dialog.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  zIndex?: number;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  size = 'md',
  className,
  zIndex = 50
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange?.(false);
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full m-4',
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full max-h-[95vh] overflow-hidden flex flex-col ${sizeClasses[size]} ${className || ''}`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

// Resto de componentes igual que antes...
export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`flex flex-col h-full ${className || ''}`}>{children}</div>;
};

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b ${className || ''}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
      {children}
    </h2>
  );
};

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t ${className || ''}`}>
      {children}
    </div>
  );
};
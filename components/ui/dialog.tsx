// components/ui/dialog.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onOpenChange, 
  children,
  size = 'md'
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
    xl: 'max-w-xl'
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-hidden ${sizeClasses[size]}`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

// Resto de componentes igual que antes...
export const DialogContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col h-full">{children}</div>;
};

export const DialogHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col space-y-1.5 text-center sm:text-left p-6 border-b">
      {children}
    </div>
  );
};

export const DialogTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="text-lg font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
};

export const DialogFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t">
      {children}
    </div>
  );
};
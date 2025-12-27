import * as React from "react"

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ title, description, variant }: any) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, title, description, variant };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toast, toasts }
}

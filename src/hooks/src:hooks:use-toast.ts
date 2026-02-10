import { useState, useEffect } from "react"

// Simple mock toast to prevent crashes if the full Toaster isn't installed
// In a full production app, this would connect to a Context Provider
type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const newToast = { title, description, variant }
    setToasts((prev) => [...prev, newToast])
    
    // In a real app, this logic handles the UI popup
    // For now, we just acknowledge the function call so the app doesn't crash
  }

  return {
    toast,
    toasts,
    dismiss: (_id?: string) => {}
  }
}
// This is a simplified version of the toast component from shadcn/ui
// Normally this would be more robust, but for our purposes, this will work

import { useState } from "react";

type ToastVariant = "default" | "destructive";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

// Simple toast implementation
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...props, id };
    
    // Add the toast to the state
    setToasts((prev) => [...prev, newToast]);
    
    // Log the toast content to console (since we're not implementing the UI)
    console.log(`Toast: ${props.title} - ${props.description}`);
    
    // Remove the toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast));
    }, 5000);
  };

  return { toast, toasts };
} 
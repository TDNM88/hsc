"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export function Toaster({ position = "top-right" }: { position?: ToastPosition }) {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className={
          position === "top-right" ? "fixed top-4 right-4" :
          position === "top-left" ? "fixed top-4 left-4" :
          position === "bottom-right" ? "fixed bottom-4 right-4" : "fixed bottom-4 left-4"
        } />
    </ToastProvider>
  )
}

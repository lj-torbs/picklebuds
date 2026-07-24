/* eslint-disable react-refresh/only-export-components */
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
const ToastPortal = ToastPrimitive.Portal
const useToast = ToastPrimitive.useToastManager

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed bottom-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2 outline-none",
        className
      )}
      {...props}
    />
  )
}

function ToastRoot({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border bg-card p-4 pr-8 text-card-foreground shadow-lg transition-all",
        "data-starting-style:translate-x-[calc(100%+1rem)] data-starting-style:opacity-0",
        "data-ending-style:opacity-0",
        "data-[type=success]:border-primary/40",
        "data-[type=error]:border-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Dismiss"
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:bg-muted hover:opacity-100",
        className
      )}
      {...props}
    >
      <XIcon className="size-3.5" aria-hidden="true" />
    </ToastPrimitive.Close>
  )
}

export {
  useToast,
  ToastProvider,
  ToastPortal,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
}

"use client"

import * as React from "react"
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ToastVariant = "default" | "success" | "destructive" | "info"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...props, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const iconMap: Record<ToastVariant, React.ReactNode> = {
  default: <InfoIcon className="size-4" />,
  success: <CheckCircleIcon className="size-4 text-green-600" />,
  destructive: <AlertCircleIcon className="size-4 text-destructive" />,
  info: <InfoIcon className="size-4 text-blue-600" />,
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  return (
    <div
      className={cn(
        "flex w-80 items-start gap-3 rounded-lg border bg-popover p-4 shadow-lg animate-in slide-in-from-right-full fade-in duration-200",
      )}
    >
      <span className="mt-0.5 shrink-0">{iconMap[toast.variant ?? "default"]}</span>
      <div className="flex-1 space-y-1">
        {toast.title && <p className="text-sm font-medium">{toast.title}</p>}
        {toast.description && (
          <p className="text-sm text-muted-foreground">{toast.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onDismiss}
        className="shrink-0"
      >
        <XIcon className="size-3" />
      </Button>
    </div>
  )
}

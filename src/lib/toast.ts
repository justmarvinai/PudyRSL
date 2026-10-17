import { create } from 'zustand'

export type ToastKind = 'success' | 'info' | 'warn' | 'error'

export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, kind?: ToastKind) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, kind = 'success') => {
    const id = ++seq
    set({ toasts: [...get().toasts.slice(-3), { id, message, kind }] })
    window.setTimeout(() => get().dismiss(id), 3200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (message: string, kind?: ToastKind) => useToasts.getState().push(message, kind)

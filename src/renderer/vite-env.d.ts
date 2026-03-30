/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) => void
    windowDrag: (delta: { x: number; y: number }) => void
    getScreenSize: () => Promise<{ width: number; height: number }>
    onChangePet: (callback: (pet: string) => void) => void
    onToggleSound: (callback: (enabled: boolean) => void) => void
  }
}

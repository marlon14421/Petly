import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward: boolean }) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  windowDrag: (delta: { x: number; y: number }) =>
    ipcRenderer.send('window-drag', delta),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  onChangePet: (callback: (pet: string) => void) => ipcRenderer.on('change-pet', (_event, pet) => callback(pet)),
  onToggleSound: (callback: (enabled: boolean) => void) => ipcRenderer.on('toggle-sound', (_event, enabled) => callback(enabled)),
})

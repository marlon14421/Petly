import { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'logo-removebg-preview.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Pet Type',
      submenu: [
        { label: 'Cat', type: 'radio', checked: true, click: () => mainWindow?.webContents.send('change-pet', 'cat') },
        { label: 'Miku', type: 'radio', click: () => mainWindow?.webContents.send('change-pet', 'miku') },
        { label: 'Ghost', type: 'radio', click: () => mainWindow?.webContents.send('change-pet', 'ghost') },
      ]
    },
    {
      label: 'Sounds',
      type: 'checkbox',
      checked: true,
      click: (menuItem) => mainWindow?.webContents.send('toggle-sound', menuItem.checked)
    },
    { type: 'separator' },
    { label: 'Close', click: () => app.quit() }
  ])

  tray.setToolTip('Petly')
  tray.setContextMenu(contextMenu)
}

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
  
  const windowWidth = 250
  const windowHeight = 250

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: screenWidth - windowWidth - 50,
    y: screenHeight - windowHeight - 50,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    icon: path.join(app.getAppPath(), 'logo-removebg-preview.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  })

  // Load the app
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'))
  }

  // Allow clicking through transparent parts of the window
  mainWindow.setIgnoreMouseEvents(false) // Start with mouse events enabled

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC handlers for window management and pet state
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.setIgnoreMouseEvents(ignore, options)
})

ipcMain.on('window-drag', (event, { x, y }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    const [currentX, currentY] = win.getPosition()
    win.setPosition(currentX + x, currentY + y)
  }
})

ipcMain.handle('get-screen-size', () => {
  return screen.getPrimaryDisplay().workAreaSize
})

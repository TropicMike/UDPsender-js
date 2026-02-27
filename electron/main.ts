import { app, BrowserWindow, shell } from 'electron';
import path from 'path';

interface ServerModule {
  serverReady: Promise<void>;
  actualPort: number;
}

// Set PORT=0 before requiring the server so the OS assigns a free port,
// preventing conflicts if port 3000 is already in use.
if (!process.env.PORT) {
  process.env.PORT = '0';
}

// Both dev (npm run electron) and packaged modes run from dist/electron/,
// so server is always one level up at dist/server.js
const serverPath = path.join(__dirname, '..', 'server');

// Requiring this module starts the Express server immediately (side effect).
// Do NOT destructure actualPort here — it is updated asynchronously when the
// server binds, so we must read it from the module object after serverReady resolves.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverModule = require(serverPath) as ServerModule;
const { serverReady } = serverModule;

let mainWindow: BrowserWindow | null = null;

function createWindow(port: number): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 400,
    minHeight: 500,
    title: 'UDP Sender',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await serverReady;
    createWindow(serverModule.actualPort);
  } catch (err) {
    console.error('Failed to start Express server:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow(serverModule.actualPort);
  }
});

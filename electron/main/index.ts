import ComponentManager from '@main/componentManager';
import CoreLoader from '@main/coreLoader';
import DeviceDetector from '@main/deviceDetector';
import useHooks from '@main/hooks';
import StorageManager from '@main/storageManager';
import useDebug from '@main/utils/debug';
import logger from '@main/utils/logger';
import { getPlatform, isInDev } from '@main/utils/os';
// modules
import WindowManager from '@main/windowManager';
import { BrowserWindow, app, shell } from 'electron';
import fs from 'fs';
import { release } from 'os';
import { join } from 'path';

import DownloadManager from './downloadManager';
import { setupHookProxy } from './utils/ipc-main';
import { getAppBaseDir } from './utils/path';

require('source-map-support').install();

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (getPlatform() === 'windows') app.setAppUserModelId(app.getName());

logger.info(`Electron version: ${process.versions.electron}`);
logger.info(`Chromium version: ${process.versions.chrome}`);
logger.info(`Node version: ${process.versions.node}`);

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

async function createApp(): Promise<void> {
  setupHookProxy();

  const win = new WindowManager().getWindow();
  if (app.isPackaged || !isInDev()) {
    win.loadFile(join(__dirname, '../../index.html'));
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const host = process.env.VITE_DEV_SERVER_HOST;
    const port = process.env.VITE_DEV_SERVER_PORT;
    const url = `http://${host ?? 'localhost'}:${port ?? '3344'}`;
    win.loadURL(url);
  }
  const modulesCtor = [
    WindowManager,
    StorageManager,
    CoreLoader,
    DeviceDetector,
    DownloadManager,
    ComponentManager,
  ];

  for (const Ctor of modulesCtor) {
    try {
      const m = new Ctor();
      logger.info(`module ${m.name}-v${m.version} loaded.`);
    } catch (e) {
      logger.error(`module ${Ctor.name} load failed!`);
    }
  }
  useHooks();
  if (isInDev()) {
    logger.warn('You are in development mode');
    win.webContents.on('did-frame-finish-load', () => {
      useDebug(win);
    });
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // bypass cors
  win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
  });

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Headers': ['*'],
        ...details.responseHeaders,
      },
    });
  });
}

app.whenReady().then(createApp);

app.on('window-all-closed', () => {
  // const win = new Window().get();
  // win = null;
  app.quit();
});

app.on('will-quit', () => {
  const tokenPath = join(app.getPath('temp'), 'clearConfigToken');
  const exist = fs.existsSync(tokenPath);
  if (exist) {
    fs.rmSync(tokenPath);
    // 仅能对正式环境使用
    // if (!isInDev()) {
    const configFilePath = join(getAppBaseDir(), 'config.json');
    fs.rmSync(configFilePath);
    app.relaunch();
    // }
  }
});

app.on('second-instance', () => {
  const win = new WindowManager().getWindow();

  // Focus on the main window if the user tried to open another
  if (win?.isMinimized()) win?.restore();
  win?.focus();
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length > 0) {
    allWindows[0].focus();
  } else {
    createApp();
  }
});

/* eslint-disable @typescript-eslint/no-invalid-void-type */
import logger from '@main/utils/logger';
import WindowManager from '@main/windowManager';
import type {
  IpcMainHandleEvent,
  IpcMainHandleEventType,
  IpcRendererOnEvent,
  IpcRendererOnEventType,
} from '@type/ipc';
import { createCalleeProxy, createCallerProxy } from '@type/ipc/utils';
import { type IpcMainInvokeEvent, ipcMain } from 'electron';

/**
 * 添加 ipc 调用的处理事件
 */
function ipcMainHandle<Key extends IpcMainHandleEvent>(
  eventName: Key,
  listener: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<IpcMainHandleEventType[Key]>
  ) => ReturnType<IpcMainHandleEventType[Key]>,
): void {
  // re-register handler
  ipcMain.removeHandler(eventName);
  ipcMain.handle(eventName, (event, ...args) => {
    logger.silly(`Receive ipcMain event: ${eventName}`);
    return listener(event, ...(args as Parameters<IpcMainHandleEventType[Key]>));
  });
}

function ipcMainRemove(eventName: IpcMainHandleEvent): void {
  ipcMain.removeHandler(eventName);
}

function ipcMainSend<Key extends IpcRendererOnEvent>(
  eventName: Key,
  ...args: Parameters<IpcRendererOnEventType[Key]>
): void {
  const win = new WindowManager().getWindow();
  logger.silly(`Send ipcRenderer event: ${eventName}`);
  win.webContents.send(eventName, ...args);
}

let inited = false;

export function setupHookProxy() {
  if (inited) {
    return;
  }

  globalThis.renderer = createCallerProxy<IpcRendererOnEventType, 'renderer'>(
    'renderer',
    (key, ...args) => {
      ipcMainSend(key, ...args);
    },
  );

  globalThis.main = createCalleeProxy<IpcMainHandleEventType, 'main', Electron.IpcMainInvokeEvent>(
    'main',
    ipcMainHandle,
    ipcMainRemove,
    () => void 0,
  );

  inited = true;
}

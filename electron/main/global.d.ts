import type { IpcMainHandleEventCalleeProxy, IpcRendererOnEventProxy } from '@type/ipc';

export {};

declare global {
  let renderer: IpcRendererOnEventProxy;
  let main: IpcMainHandleEventCalleeProxy;
}

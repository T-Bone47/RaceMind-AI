import { contextBridge, ipcRenderer } from "electron";

/**
 * The only surface the renderer can reach into the main process through -
 * contextIsolation is on and nodeIntegration is off, so this is
 * deliberately narrow rather than exposing ipcRenderer wholesale.
 */
const racemindBridge = {
  getVersion: (): Promise<string> => ipcRenderer.invoke("app:get-version"),
  getPlatform: (): Promise<NodeJS.Platform> => ipcRenderer.invoke("app:get-platform"),
};

contextBridge.exposeInMainWorld("racemind", racemindBridge);

export type RacemindBridge = typeof racemindBridge;

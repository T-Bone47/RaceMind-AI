"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * The only surface the renderer can reach into the main process through -
 * contextIsolation is on and nodeIntegration is off, so this is
 * deliberately narrow rather than exposing ipcRenderer wholesale.
 */
const racemindBridge = {
    getVersion: () => electron_1.ipcRenderer.invoke("app:get-version"),
    getPlatform: () => electron_1.ipcRenderer.invoke("app:get-platform"),
};
electron_1.contextBridge.exposeInMainWorld("racemind", racemindBridge);

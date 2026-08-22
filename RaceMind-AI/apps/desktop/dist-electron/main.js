"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
const VITE_DEV_SERVER_URL = "http://localhost:5173";
let mainWindow = null;
let agentProcess = null;
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on("second-instance", () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    function startAgent(customWssUrl) {
        if (agentProcess) {
            agentProcess.kill();
            agentProcess = null;
        }
        if (electron_1.app.isPackaged) {
            // In production, run the bundled desktop_agent.exe
            const agentPath = node_path_1.default.join(process.resourcesPath, "agent", "desktop_agent.exe");
            const env = { ...process.env };
            if (customWssUrl) {
                env.CLOUD_WSS_URL = customWssUrl;
            }
            else if (!env.CLOUD_WSS_URL) {
                env.CLOUD_WSS_URL = "wss://racemind-ai-production.up.railway.app/ws/telemetry/ingest";
            }
            agentProcess = (0, node_child_process_1.spawn)(agentPath, [], { env });
        }
        else {
            // In dev, we assume uv run python from the backend dir
            const backendDir = node_path_1.default.join(__dirname, "../../backend");
            const env = { ...process.env };
            if (customWssUrl) {
                env.CLOUD_WSS_URL = customWssUrl;
            }
            agentProcess = (0, node_child_process_1.spawn)("uv", ["run", "python", "desktop_agent.py"], {
                cwd: backendDir,
                env
            });
        }
        agentProcess.stdout?.on("data", (data) => {
            console.log(`Agent: ${data}`);
        });
        agentProcess.stderr?.on("data", (data) => {
            console.error(`Agent Error: ${data}`);
        });
        agentProcess.on("close", (code) => {
            console.log(`Agent process exited with code ${code}`);
            agentProcess = null;
        });
    }
    function createMainWindow() {
        mainWindow = new electron_1.BrowserWindow({
            width: 1440,
            height: 900,
            minWidth: 1024,
            minHeight: 700,
            backgroundColor: "#0A0B0D",
            titleBarStyle: "hiddenInset",
            show: false,
            webPreferences: {
                preload: node_path_1.default.join(__dirname, "preload.js"),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
        });
        mainWindow.once("ready-to-show", () => {
            mainWindow?.show();
        });
        // Open external links (docs, GitHub) in the OS browser, not inside the app window.
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            void electron_1.shell.openExternal(url);
            return { action: "deny" };
        });
        if (isDev) {
            void mainWindow.loadURL(VITE_DEV_SERVER_URL);
            mainWindow.webContents.openDevTools({ mode: "detach" });
        }
        else {
            void mainWindow.loadFile(node_path_1.default.join(__dirname, "../dist/index.html"));
        }
        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    }
    electron_1.ipcMain.handle("app:get-version", () => electron_1.app.getVersion());
    electron_1.ipcMain.handle("app:get-platform", () => process.platform);
    electron_1.ipcMain.handle("agent:restart", (_, url) => {
        // Transform http/https URL to ws/wss URL
        const wssUrl = url.replace("http://", "ws://").replace("https://", "wss://") + "/ws/telemetry/ingest";
        startAgent(wssUrl);
    });
    electron_1.app.whenReady().then(() => {
        startAgent();
        createMainWindow();
    });
    electron_1.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
    electron_1.app.on("will-quit", () => {
        if (agentProcess) {
            agentProcess.kill();
        }
    });
}

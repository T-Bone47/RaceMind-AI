import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const VITE_DEV_SERVER_URL = "http://localhost:5173";

let mainWindow: BrowserWindow | null = null;
let agentProcess: ChildProcess | null = null;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function startAgent(customWssUrl?: string) {
    if (agentProcess) {
      agentProcess.kill();
      agentProcess = null;
    }

    if (app.isPackaged) {
      // In production, run the bundled local_backend.exe
      const agentPath = path.join(process.resourcesPath, "agent", "local_backend.exe");
      
      const env = { ...process.env };
      if (customWssUrl) {
        env.CLOUD_WSS_URL = customWssUrl;
      }

      agentProcess = spawn(agentPath, [], { env });
    } else {
      // In dev, we assume uv run python from the backend dir
      const backendDir = path.join(__dirname, "../../../backend");
      const env = { ...process.env };
      if (customWssUrl) {
        env.CLOUD_WSS_URL = customWssUrl;
      }
      agentProcess = spawn("uv", ["run", "python", "local_backend.py"], { 
        cwd: backendDir,
        env,
        shell: process.platform === "win32"
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

  function createMainWindow(): void {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1024,
      minHeight: 700,
      backgroundColor: "#0A0B0D",
      titleBarStyle: "hiddenInset",
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
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
      void shell.openExternal(url);
      return { action: "deny" };
    });

    if (isDev) {
      mainWindow.loadURL(VITE_DEV_SERVER_URL).catch(() => {
        // Fallback to built files if Vite is not running
        void mainWindow?.loadFile(path.join(__dirname, "../dist/index.html"));
      });
      mainWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  ipcMain.handle("app:get-version", () => app.getVersion());
  ipcMain.handle("app:get-platform", () => process.platform);
  ipcMain.handle("agent:restart", (_, url) => {
    // Transform http/https URL to ws/wss URL
    const wssUrl = url.replace("http://", "ws://").replace("https://", "wss://") + "/ws/telemetry/ingest";
    startAgent(wssUrl);
  });

  app.whenReady().then(() => {
    startAgent();
    createMainWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  app.on("will-quit", () => {
    if (agentProcess) {
      agentProcess.kill();
    }
  });
}

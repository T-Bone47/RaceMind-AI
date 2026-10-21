/// <reference types="vite/client" />

interface Window {
  racemind?: import('../electron/preload').RacemindBridge;
}

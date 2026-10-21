import type { RacemindBridge } from "../../electron/preload";

declare global {
  interface Window {
    racemind: RacemindBridge;
  }
}

export {};

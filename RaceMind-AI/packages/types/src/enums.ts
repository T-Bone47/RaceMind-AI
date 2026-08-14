/**
 * Mirrors backend/database/models/enums.py and backend/telemetry/models.py.
 * Keep these string values in sync with the Python source - they're the
 * wire format, not just labels.
 */

export type GameTitle =
  | "f1_15"
  | "f1_16"
  | "f1_17"
  | "f1_18"
  | "f1_19"
  | "f1_20"
  | "f1_21"
  | "f1_22"
  | "f1_23"
  | "f1_24"
  | "f1_25"
  | "f1_26"
  | "assetto_corsa"
  | "acc"
  | "iracing"
  | "le_mans_ultimate"
  | "rfactor_2";

export type SessionType = "practice" | "qualifying" | "race" | "time_trial";

export type WeatherCondition =
  | "clear"
  | "light_cloud"
  | "overcast"
  | "light_rain"
  | "heavy_rain"
  | "storm";

export type TyreCompound = "soft" | "medium" | "hard" | "intermediate" | "wet";

export const GAME_TITLE_LABELS: Record<GameTitle, string> = {
  f1_15: "F1 2015",
  f1_16: "F1 2016",
  f1_17: "F1 2017",
  f1_18: "F1 2018",
  f1_19: "F1 2019",
  f1_20: "F1 2020",
  f1_21: "F1 2021",
  f1_22: "F1 2022",
  f1_23: "F1 23",
  f1_24: "F1 24",
  f1_25: "F1 25",
  f1_26: "F1 26",
  assetto_corsa: "Assetto Corsa",
  acc: "Assetto Corsa Competizione",
  iracing: "iRacing",
  le_mans_ultimate: "Le Mans Ultimate",
  rfactor_2: "rFactor 2",
};

export const TYRE_COMPOUND_LABELS: Record<TyreCompound, string> = {
  soft: "Soft",
  medium: "Medium",
  hard: "Hard",
  intermediate: "Intermediate",
  wet: "Wet",
};

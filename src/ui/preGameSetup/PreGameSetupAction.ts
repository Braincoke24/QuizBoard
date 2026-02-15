// src/ui/preGameSetup/PreGameSetupAction.ts

import type { BuzzerMode } from "./PreGameSetupState.js"

export type PreGameSetupAction =
    | {
          type: "PRE_GAME_SETUP/ADD_PLAYER"
          name: string
      }
    | {
          type: "PRE_GAME_SETUP/REMOVE_PLAYER"
          id: string
      }
    | {
          type: "PRE_GAME_SETUP/SELECT_RULE"
          ruleId: string
      }
    | {
          type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER"
          key:
              | "firstWrongMultiplier"
              | "buzzCorrectMultiplier"
              | "buzzWrongMultiplier"
          value: number
      }
    | {
          type: "PRE_GAME_SETUP/SET_BUZZER_MODE"
          mode: BuzzerMode
      }
    | {
          type: "PRE_GAME_SETUP/START_GAME"
      }

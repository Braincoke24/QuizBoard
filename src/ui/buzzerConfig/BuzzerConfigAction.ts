// src/ui/buzzerConfig/BuzzerConfigAction.ts

export type BuzzerConfigAction =
    | {
          type: "BUZZER_CONFIG/SKIP_PLAYER"
      }
    | {
          type: "BUZZER_CONFIG/ASSIGN_KEY"
          key: string
      }

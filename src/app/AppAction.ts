// src/app/AppAction.ts
import { BoardDraftAction } from "../ui/editBoard/BoardDraftAction.js"
import { PreGameSetupAction } from "../ui/preGameSetup/PreGameSetupAction.js"
import { BuzzerConfigAction } from "../ui/buzzerConfig/BuzzerConfigAction.js"
import { GameAction } from "../ui/game/GameAction.js"
import { GameEndAction } from "../ui/gameEnd/GameEndAction.js"

export type AppAction =
    | {
        type: "APP/BOARD_DRAFT"
        action: BoardDraftAction
    }
    | {
        type: "APP/PRE_GAME_SETUP"
        action: PreGameSetupAction
    }
    | {
        type: "APP/BUZZER_CONFIG"
        action: BuzzerConfigAction
    }
    | {
        type: "APP/GAME"
        action: GameAction
    }
    | {
        type: "APP/GAME_ENDED"
        action: GameEndAction
    }

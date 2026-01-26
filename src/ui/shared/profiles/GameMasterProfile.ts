// src/ui/profiles/GameMasterProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"
import { ViewMode } from "../view/ViewMode.js"

export const GAMEMASTER_PROFILE: UIViewProfile = {
    visibility: {
        showCorrectAnswer: true
    },
    capabilities: {
        canBuzz: true,
        canJudgeAnswer: true,
        canPass: true,
        canSelectQuestion: true
    },
    input: {
        enableKeyboardBuzzing: false,
        enableMouse: true
    },
    mode: ViewMode.GAME_MASTER
}

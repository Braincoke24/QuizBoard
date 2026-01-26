// src/ui/profiles/PlayerProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"
import { ViewMode } from "../view/ViewMode.js"

export const PLAYER_PROFILE: UIViewProfile = {
    visibility: {
        showCorrectAnswer: false
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
    mode: ViewMode.PLAYER
}

// src/ui/profiles/SpectatorProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"
import { ViewMode } from "../view/ViewMode.js"

export const SPECTATOR_PROFILE: UIViewProfile = {
    visibility: {
        showCorrectAnswer: false
    },
    capabilities: {
        canBuzz: false,
        canJudgeAnswer: false,
        canPass: false,
        canSelectQuestion: false
    },
    input: {
        enableKeyboardBuzzing: false, // TODO: implement that
        enableMouse: false // TODO: implement that
    },
    mode: ViewMode.PLAYER
}

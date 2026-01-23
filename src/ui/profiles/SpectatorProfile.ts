// src/ui/profiles/SpectatorProfile.ts
import { UIViewProfile } from "../state/UIViewProfile.js"

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
        enableKeyboardBuzzing: false,
        enableMouse: false
    }
}

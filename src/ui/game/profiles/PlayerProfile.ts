// src/ui/profiles/PlayerProfile.ts
import { UIViewProfile } from "../state/UIViewProfile.js"

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
    }
}

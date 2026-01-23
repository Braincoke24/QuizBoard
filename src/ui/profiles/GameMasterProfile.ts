// src/ui/profiles/GameMasterProfile.ts
import { UIViewProfile } from "../state/UIViewProfile.js"

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
    }
}

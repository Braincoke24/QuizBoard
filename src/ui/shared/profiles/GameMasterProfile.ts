// src/ui/shared/profiles/GameMasterProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"

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
    displayName: "Gamemaster"
}

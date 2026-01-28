// src/ui/shared/profiles/SpectatorProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"

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
    displayName: "Spectator"
}

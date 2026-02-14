// src/ui/shared/profiles/SpectatorProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"

export const SPECTATOR_PROFILE: UIViewProfile = {
    visibility: {
        showCorrectAnswer: false,
        showBoardEditor: false,
        showPreGameSetup: true,
    },
    capabilities: {
        canBuzz: false,
        canJudgeAnswer: false,
        canPass: false,
        canSelectQuestion: false,
        canContinue: false,
    },
    displayName: "Spectator",
}

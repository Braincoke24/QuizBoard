// src/ui/shared/profiles/PlayerProfile.ts
import { UIViewProfile } from "../view/UIViewProfile.js"

export const PLAYER_PROFILE: UIViewProfile = {
    visibility: {
        showCorrectAnswer: false,
        showBoardEditor: true,
        showPreGameSetup: true,
    },
    capabilities: {
        canBuzz: true,
        canJudgeAnswer: true,
        canPass: true,
        canSelectQuestion: true,
        canContinue: true,
    },
    id: "player",
}

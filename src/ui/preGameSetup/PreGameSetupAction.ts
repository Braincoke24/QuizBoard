// src/ui/preGameSetup/PreGameSetupAction.ts

export type PreGameSetupAction =
    | {
        type: "PRE_GAME_SETUP/ADD_PLAYER"
        name: string
    }
    | {
        type: "PRE_GAME_SETUP/REMOVE_PLAYER"
        id: string
    }
    | {
        type: "PRE_GAME_SETUP/SUBMIT"
    }

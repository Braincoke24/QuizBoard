// src/ui/game/GameAction.ts

export type GameAction =
    | {
        type: "GAME/SELECT_QUESTION"
        categoryIndex: number
        questionIndex: number
    }
    | {
        type: "GAME/BUZZ"
        playerId: string
    }
    | {
        type: "GAME/ANSWER"
        correct: boolean
    }
    | {
        type: "GAME/PASS"
    }
    | {
        type: "GAME/CONTINUE"
    }

// src/ui/game/GameViewAdapter.ts
import { GameViewRenderer } from "./GameViewRenderer.js"
import { GameAction } from "./GameAction.js"
import { GameUISnapshot } from "./state/GameUISnapshot.js"
import { UIViewProfile } from "../shared/view/UIViewProfile.js"

/**
 * Connects the game UI renderer to the App via dispatch and snapshots.
 */
export class GameViewAdapter {
    private readonly renderer: GameViewRenderer

    constructor(
        dispatch: (action: GameAction) => void,
        profile: UIViewProfile,
        root: HTMLElement
    ) {
        // UI command handlers – translate renderer callbacks into GameActions
        const selectQuestion = (categoryIndex: number, questionIndex: number): void => {
            dispatch({type: "GAME/SELECT_QUESTION", categoryIndex, questionIndex})
        }

        const buzz = (playerId: string): void => {
            dispatch({ type: "GAME/BUZZ", playerId })
        }

        const answer = (correct: boolean): void => {
            dispatch({ type: "GAME/ANSWER", correct })
        }

        const pass = (): void => {
            dispatch({ type: "GAME/PASS" })
        }

        const continueGame = (): void => {
            dispatch({type: "GAME/CONTINUE"})
        }
                
        this.renderer = new GameViewRenderer(
            root,
            profile,
            selectQuestion,
            buzz,
            answer,
            pass,
            continueGame
        )
    }

    public render(snapshot: GameUISnapshot): void {
        this.renderer.render(snapshot)
    }
}

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
        function selectQuestion(categoryIndex: number, questionIndex: number): void {
            dispatch({type: "GAME/SELECT_QUESTION", categoryIndex, questionIndex})
        }

        function buzz(playerId: string): void {
            dispatch({ type: "GAME/BUZZ", playerId })
        }

        function answer(correct: boolean): void {
            dispatch({ type: "GAME/ANSWER", correct })
        }

        function pass(): void {
            dispatch({ type: "GAME/PASS" })
        }
                
        this.renderer = new GameViewRenderer(
            root,
            profile,
            selectQuestion,
            buzz,
            answer,
            pass
        )
    }

    public render(snapshot: GameUISnapshot): void {
        this.renderer.render(snapshot)
    }
}

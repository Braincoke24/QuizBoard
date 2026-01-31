// src/ui/gameEnd/GameEndAdapter.ts
import { PlayerUIState } from "../game/state/GameUIState.js"
import { GameEndAction } from "./GameEndAction.js"
import { GameEndRenderer } from "./GameEndRenderer.js"

/**
 * Connects the PreGameSetup renderer to the App via dispatch and snapshots.
 */
export class GameEndAdapter {
    private readonly renderer: GameEndRenderer

    constructor(
        dispatch: (action: GameEndAction) => void,
        root: HTMLElement
    ) {
        this.renderer = new GameEndRenderer(
            root
        )
    }

    public render(players: readonly PlayerUIState[]): void {
        this.renderer.render(players)
    }
}

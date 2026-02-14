// src/ui/gameEnd/GameEndAdapter.ts
import { mount, unmount } from "svelte"
import { UIAdapter } from "../shared/adapter/UIAdapter.js"
import { PlayerUIState } from "../game/state/GameUIState.js"
import { GameEndAction } from "./GameEndAction.js"
import GameEndView from "./GameEndView.svelte"

/**
 * Connects the GameEndRenderer to the App via dispatch and snapshots.
 */
export class GameEndAdapter implements UIAdapter {
    private component: ReturnType<typeof mount> | null = null

    constructor(
        dispatch: (action: GameEndAction) => void,
        root: HTMLElement,
        players: readonly PlayerUIState[]
    ) {
        root.className = "app-content-root game-ended"
        root.innerHTML = ""
        
        this.component = mount(GameEndView, {
            target: root,
            props: {
                players: players,
                onStartNewGame: (): void => {
                    dispatch({
                        type: "GAME_ENDED/START_NEW_GAME"
                    })
                }
            }
        })
    }

    public destroy(): void {
        if (this.component) {
            unmount(this.component)
        }
    }
}

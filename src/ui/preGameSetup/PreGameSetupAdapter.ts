// src/ui/preGameSetup/PreGameSetupAdapter.ts
import { PreGameSetupRenderer } from "./PreGameSetupRenderer.js"
import { PreGameSetupAction } from "./PreGameSetupAction.js"
import { PreGameSetup } from "./PreGameSetupState.js"
import { BoardDraft } from "../editBoard/BoardDraftState.js"

/**
 * Connects the PreGameSetup renderer to the App via dispatch and snapshots.
 */
export class PreGameSetupAdapter {
    private readonly renderer: PreGameSetupRenderer

    constructor(
        dispatch: (action: PreGameSetupAction) => void,
        root: HTMLElement
    ) {
        const addPlayer = (name: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/ADD_PLAYER",
                name
            })
        }

        const removePlayer = (id: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/REMOVE_PLAYER",
                id
            })
        }

        const startGame = (): void => {
            dispatch({
                type: "PRE_GAME_SETUP/START_GAME"
            })
        }

        this.renderer = new PreGameSetupRenderer(
            root,
            addPlayer,
            removePlayer,
            startGame
        )
    }

    public render(snapshot: PreGameSetup): void {
        this.renderer.render(
            snapshot.board,
            snapshot.players
        )
    }
}

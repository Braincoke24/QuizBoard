// src/ui/preGameSetup/PreGameSetupAdapter.ts
import { PreGameSetupRenderer } from "./PreGameSetupRenderer.js"
import { PreGameSetupAction } from "./PreGameSetupAction.js"
import { PreGameSetup } from "./PreGameSetupState.js"
import { GAME_RULE_PRESETS } from "../../game/GameRulePresets.js"

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

        const selectRule = (ruleId: string): void => {
            dispatch({
                type: "PRE_GAME_SETUP/SELECT_RULE",
                ruleId
            })
        }

        const updateMultiplier = (
            key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
            value: number
        ): void => {
            dispatch({
                type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
                key,
                value
            })
        }

        const startGame = (): void => {
            dispatch({
                type: "PRE_GAME_SETUP/START_GAME"
            })
        }

        this.renderer = new PreGameSetupRenderer(
            root,
            GAME_RULE_PRESETS,
            addPlayer,
            removePlayer,
            selectRule,
            updateMultiplier,
            startGame
        )
    }

    public render(snapshot: PreGameSetup): void {
        this.renderer.render(snapshot)
    }
}

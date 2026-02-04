// src/ui/landing/renderers/WaitForSetupAdapter.ts

// src/ui/gameEnd/GameEndAdapter.ts
import { PlayerUIState } from "../game/state/GameUIState.js"
import { WaitForSetupRenderer } from "./WaitForSetupRenderer.js"

/**
 * Connects the PreGameSetup renderer to the App via dispatch and snapshots.
 */
export class WaitForSetupAdapter {
    private readonly renderer: WaitForSetupRenderer

    constructor(
        root: HTMLElement
    ) {
        this.renderer = new WaitForSetupRenderer(root)
    }

    public render(players?: readonly PlayerUIState[]): void {
        this.renderer.render(players)
    }
}

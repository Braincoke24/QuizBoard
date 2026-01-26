// src/ui/preGameSetup/PreGameSetupAdapter.ts
import { PreGameSetupController } from "./PreGameSetupController.js"
import { PreGameSetupRenderer } from "./PreGameSetupRenderer.js"

export class PreGameSetupAdapter {
    private readonly controller: PreGameSetupController
    private readonly renderer: PreGameSetupRenderer

    constructor(controller: PreGameSetupController, root: HTMLElement) {
        this.controller = controller

        this.renderer = new PreGameSetupRenderer(
            root,
            this.handleAddPlayer.bind(this),
            this.handleRemovePlayer.bind(this)
        )

        this.render()
    }
    
    private render(): void {
        this.renderer.render(
            this.controller.getBoardDraft(),
            this.controller.getPlayers()
        )
    }

    /* ---------- Callbacks from Renderer ---------- */

    private handleAddPlayer(name: string): void {
        try {
            this.controller.addPlayer(name)
            this.render()
        } catch (error) {
            alert((error as Error).message)
        }
    }

    private handleRemovePlayer(id: string): void {
        this.controller.removePlayer(id)
        this.render()
    }
}

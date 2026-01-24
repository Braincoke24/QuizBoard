// src/ui/landing/adapters/LandingPageAdapter.ts
import { LandingController } from "../controllers/LandingController.js"
import { LandingPageRenderer } from "../renderers/LandingPageRenderer.js"
import { BoardDraft } from "../state/BoardDraft.js"

export class LandingPageAdapter {
    private readonly controller: LandingController
    private readonly renderer: LandingPageRenderer

    constructor(controller: LandingController, root: HTMLElement) {
        this.controller = controller
        this.renderer = new LandingPageRenderer(
            root,
            this.handleDraftChange.bind(this),
            this.handleSubmitBoard.bind(this),
            this.handleImportBoard.bind(this)
        )

        this.render()
    }

    private render(): void {
        this.renderer.render(
            this.controller.getBoardDraft(),
            this.controller.isBoardLocked()
        )
    }

    /* ---------- Callbacks from Renderer ---------- */

    private handleDraftChange(draft: BoardDraft): void {
        try {
            this.controller.updateBoardDraft(draft)
        } catch (error) {
            alert((error as Error).message)
        }
    }

    private handleSubmitBoard(): void {
        try {
            this.controller.submitBoard()
            this.render()
        } catch (error) {
            alert((error as Error).message)
        }
    }

    private handleImportBoard(json: unknown): void {
        try {
            this.controller.importBoard(json)
            this.render()
        } catch (error) {
            alert((error as Error).message)
        }
    }
}

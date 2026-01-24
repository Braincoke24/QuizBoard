// src/ui/landing/adapters/LandingPageAdapter.ts
import { LandingController } from "../controllers/LandingController.js"
import { BoardDraftEditorRenderer } from "../renderers/BoardDraftEditorRenderer.js"
import { BoardDraft } from "../state/BoardDraft.js"

export class LandingPageAdapter {
    private readonly controller: LandingController
    private readonly renderer: BoardDraftEditorRenderer

    constructor(controller: LandingController, root: HTMLElement) {
        this.controller = controller
        this.renderer = new BoardDraftEditorRenderer(
            root,
            this.handleDraftChange.bind(this),
            this.handleSubmitBoard.bind(this),
            this.handleImportBoard.bind(this),
            this.handleExportBoard.bind(this)
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

    private handleExportBoard(): void {
        const board = this.controller.exportBoard()

        const json = JSON.stringify(board, null, 2)
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "board.json"
        a.click()

        URL.revokeObjectURL(url)
    }
}

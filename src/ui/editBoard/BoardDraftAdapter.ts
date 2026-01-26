// src/ui/editBoard/BoardDraftAdapter.ts
import { BoardDraftController } from "./BoardDraftController.js"
import { BoardDraftEditorRenderer } from "./BoardDraftEditorRenderer.js"
import { BoardDraft } from "./BoardDraftState.js"

export class BoardDraftAdapter {
    private readonly controller: BoardDraftController
    private readonly renderer: BoardDraftEditorRenderer

    constructor(controller: BoardDraftController, root: HTMLElement) {
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
        this.renderer.render(this.controller.getBoardDraft())
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

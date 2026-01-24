// src/ui/landing/adapters/LandingPageAdapter.ts
import { LandingController } from "../controllers/LandingController.js"
import { BoardDraftEditorRenderer } from "../renderers/BoardDraftEditorRenderer.js"
import { PreGameSetupRenderer } from "../renderers/PreGameSetupRenderer.js"
import { BoardDraft } from "../state/BoardDraft.js"
import { LandingPhase } from "../state/LandingPhase.js"

export class LandingPageAdapter {
    private readonly controller: LandingController
    private readonly editorRenderer: BoardDraftEditorRenderer
    private readonly preGameRenderer: PreGameSetupRenderer

    constructor(controller: LandingController, root: HTMLElement) {
        this.controller = controller

        this.editorRenderer = new BoardDraftEditorRenderer(
            root,
            this.handleDraftChange.bind(this),
            this.handleSubmitBoard.bind(this),
            this.handleImportBoard.bind(this),
            this.handleExportBoard.bind(this)
        )

        this.preGameRenderer = new PreGameSetupRenderer(
            root,
            this.handleAddPlayer.bind(this),
            this.handleRemovePlayer.bind(this)
        )

        this.render()
    }
    
    private render(): void {
        const phase = this.controller.getPhase()

        switch (phase) {
            case LandingPhase.EDIT_BOARD:
                this.editorRenderer.render(
                    this.controller.getBoardDraft()
                )
                break

            case LandingPhase.PRE_GAME_SETUP:
                this.preGameRenderer.render(
                    this.controller.getBoardDraft(),
                    this.controller.getPlayers()
                )
                break
        }
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

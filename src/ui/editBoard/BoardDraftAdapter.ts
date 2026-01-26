// src/ui/editBoard/BoardDraftAdapter.ts
import { BoardDraftController } from "./BoardDraftController.js"
import { BoardDraftEditorRenderer } from "./BoardDraftEditorRenderer.js"
import { BoardDraft } from "./BoardDraftState.js"
import { BoardDraftAction } from "./BoardDraftAction.js"

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

    /* ---------- Rendering ---------- */

    private render(): void {
        this.renderer.render(this.controller.getSnapshot())
    }

    /* ---------- Callbacks from Renderer ---------- */

    private handleDraftChange(draft: BoardDraft): void {
        this.dispatch({
            type: "BOARD_DRAFT/UPDATE_DRAFT",
            draft
        })
    }

    private handleSubmitBoard(): void {
        this.dispatch({
            type: "BOARD_DRAFT/SUBMIT_BOARD"
        })
    }

    private handleImportBoard(json: unknown): void {
        this.dispatch({
            type: "BOARD_DRAFT/IMPORT_BOARD",
            json
        })
    }

    private handleExportBoard(): void {
        try {
            const result = this.controller.dispatch({
                type: "BOARD_DRAFT/EXPORT_BOARD"
            })

            // NOTE:
            // EXPORT_BOARD is a pure read operation.
            // It intentionally does not trigger a re-render,
            // because exporting does not mutate UI state.
            // If exporting ever affects state (e.g. analytics, flags),
            // this should be changed to go through the normal dispatch() helper.
            if (!result) return

            const json = JSON.stringify(result, null, 2)
            const blob = new Blob([json], { type: "application/json" })
            const url = URL.createObjectURL(blob)

            const a = document.createElement("a")
            a.href = url
            a.download = "board.json"
            a.click()

            URL.revokeObjectURL(url)
        } catch (error) {
            alert((error as Error).message)
        }
    }

    /* ---------- Helpers ---------- */

    private dispatch(action: BoardDraftAction): void {
        try {
            this.controller.dispatch(action)
            this.render()
        } catch (error) {
            alert((error as Error).message)
        }
    }
}

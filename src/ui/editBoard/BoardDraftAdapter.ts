// src/ui/editBoard/BoardDraftAdapter.ts
import { BoardDraftEditorRenderer } from "./BoardDraftEditorRenderer.js"
import { BoardDraft } from "./BoardDraftState.js"
import { BoardDraftAction } from "./BoardDraftAction.js"

/**
 * Connects the BoardDraft editor to the App via dispatch and snapshots.
 */
export class BoardDraftAdapter {
    private readonly renderer: BoardDraftEditorRenderer
    private lastSnapshot: BoardDraft | null = null

    constructor(
        dispatch: (action: BoardDraftAction) => void,
        root: HTMLElement
    ) {
        console.log("Started BoardDraftAdapter")

        const updateDraft = (draft: BoardDraft): void => {
            dispatch({
                type: "BOARD_DRAFT/UPDATE_DRAFT",
                draft
            })
        }

        const submitBoard = (): void => {
            dispatch({
                type: "BOARD_DRAFT/SUBMIT_BOARD"
            })
        }

        const importBoard = (json: unknown): void => {
            dispatch({
                type: "BOARD_DRAFT/IMPORT_BOARD",
                json
            })
        }

        const exportBoard = (): void => {
            try {
                const snapshot = this.getSnapshotForExport()
                const json = JSON.stringify(snapshot, null, 2)
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

        this.renderer = new BoardDraftEditorRenderer(
            root,
            updateDraft,
            submitBoard,
            importBoard,
            exportBoard
        )
    }

    public render(snapshot: BoardDraft): void {
        this.lastSnapshot = snapshot
        this.renderer.render(snapshot)
    }

    private getSnapshotForExport(): BoardDraft {
        if (!this.lastSnapshot) {
            throw new Error("No board to export")
        }
        return this.lastSnapshot
    }
}

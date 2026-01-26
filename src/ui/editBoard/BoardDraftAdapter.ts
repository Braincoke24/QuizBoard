// src/ui/editBoard/BoardDraftAdapter.ts
import { BoardDraftEditorRenderer } from "./BoardDraftEditorRenderer.js"
import { BoardDraft } from "./BoardDraftState.js"
import { BoardDraftAction } from "./BoardDraftAction.js"

/**
 * Connects the BoardDraft editor to the App via dispatch and snapshots.
 */
export class BoardDraftAdapter {
    private readonly renderer: BoardDraftEditorRenderer

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
            dispatch({
                type: "BOARD_DRAFT/EXPORT_BOARD"
            })
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
        this.renderer.render(snapshot)
    }
}

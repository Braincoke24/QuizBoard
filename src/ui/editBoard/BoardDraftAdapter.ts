// src/ui/editBoard/BoardDraftAdapter.ts
import { mount, unmount } from "svelte"
import { writable, type Writable, get } from "svelte/store"
import BoardDraftView from "./BoardDraftView.svelte"
import { BoardDraft } from "./BoardDraftState.js"
import { BoardDraftAction } from "./BoardDraftAction.js"
import { AppSnapshot } from "../../app/AppSnapshot.js"
import { SnapshotUIAdapter } from "../shared/adapter/SnapshotUIAdapter.js"

/**
 * Connects the BoardDraft editor to the App via dispatch and snapshots.
 */
export class BoardDraftAdapter implements SnapshotUIAdapter {
    private readonly draftStore: Writable<BoardDraft | null>
    private component: ReturnType<typeof mount> | null = null
    public readonly isSnapshotAdapter = true

    constructor(
        dispatch: (action: BoardDraftAction) => void,
        root: HTMLElement,
    ) {
        this.draftStore = writable(null)

        root.className = "app-content-root edit-board"
        root.innerHTML = ""

        this.component = mount(BoardDraftView, {
            target: root,
            props: {
                draft: this.draftStore,

                onDraftChange: (draft: BoardDraft): void =>
                    dispatch({ type: "BOARD_DRAFT/UPDATE_DRAFT", draft }),

                onSubmitBoard: (): void =>
                    dispatch({ type: "BOARD_DRAFT/SUBMIT_BOARD" }),

                onImportBoard: (json: unknown): void =>
                    dispatch({ type: "BOARD_DRAFT/IMPORT_BOARD", json }),

                onExportBoard: (): void => {
                    try {
                        const draft = get(this.draftStore)

                        if (!draft) {
                            throw new Error("No board draft to export")
                        }

                        const json = JSON.stringify(draft, null, 2)
                        const blob = new Blob([json], {
                            type: "application/json",
                        })
                        const url = URL.createObjectURL(blob)

                        const a = document.createElement("a")
                        a.href = url
                        a.download = "board.json"
                        a.click()

                        URL.revokeObjectURL(url)
                    } catch (error) {
                        alert((error as Error).message)
                    }
                },
            },
        })
    }

    public update(snapshot: AppSnapshot): void {
        if (!snapshot.boardDraft) return
        this.draftStore.set(snapshot.boardDraft)
    }

    public destroy(): void {
        if (this.component) unmount(this.component)
    }
}

// src/ui/editBoard/BoardDraftAction.ts
import { BoardDraft } from "./BoardDraftState.js"

export type BoardDraftAction =
    | {
        type: "update_draft"
        draft: BoardDraft
    }
    | {
        type: "import_board"
        json: unknown
    }
    | {
        type: "submit_board"
    }
    | {
        type: "export_board"
    }

// src/ui/editBoard/BoardDraftAction.ts
import { BoardDraft } from "./BoardDraftState.js"

export type BoardDraftAction =
    | {
          type: "BOARD_DRAFT/UPDATE_DRAFT"
          draft: BoardDraft
      }
    | {
          type: "BOARD_DRAFT/IMPORT_BOARD"
          json: unknown
      }
    | {
          type: "BOARD_DRAFT/IMPORT_CATEGORY"
          json: unknown
          categoryIndex: number
      }
    | {
          type: "BOARD_DRAFT/SUBMIT_BOARD"
      }

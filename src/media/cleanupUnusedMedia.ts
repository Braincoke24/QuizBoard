// src/media/cleanupUnusedMedia.ts
import { BoardDraft } from "../ui/editBoard/BoardDraftState.js"
import { deleteMediaAsset, listMediaAssets } from "./mediaStore.js"

/**
 * Collects all media IDs referenced by the given boards.
 */
function collectReferencedMediaIds(board: BoardDraft): Set<string> {
    const referenced = new Set<string>()

    for (const category of board.categories) {
        for (const question of category.questions) {
            if (question.questionMediaId) {
                referenced.add(question.questionMediaId)
            }

            if (question.answerMediaId) {
                referenced.add(question.answerMediaId)
            }
        }
    }

    return referenced
}

/**
 * Deletes all media assets that are not referenced by any board.
 *
 * Returns the number of deleted assets.
 */
export async function cleanupUnusedMedia(board: BoardDraft): Promise<number> {
    const referencedMediaIds = collectReferencedMediaIds(board)
    const storedMedia = await listMediaAssets()

    let deletedCount = 0

    for (const asset of storedMedia) {
        if (!referencedMediaIds.has(asset.id)) {
            await deleteMediaAsset(asset.id)
            deletedCount++
        }
    }

    return deletedCount
}

import JSZip from "jszip"
import { getMediaAsset } from "../../media/mediaStore.js"
import type { BoardDraft, CategoryDraft } from "./BoardDraftState.js"

export async function exportBoard(draft: BoardDraft | null): Promise<void> {
    if (!draft) return

    const mediaIds = collectMediaIds(draft)

    // ---------- Case 1: no media → plain JSON ----------
    if (mediaIds.size === 0) {
        const json = JSON.stringify(draft, null, 2)
        const blob = new Blob([json], { type: "application/json" })

        downloadBlob(blob, "board.json")
        return
    }

    // ---------- Case 2: media present → ZIP ----------
    const zip = new JSZip()

    zip.file("board.json", JSON.stringify(draft, null, 2))

    const mediaFolder = zip.folder("media")
    if (!mediaFolder) {
        throw new Error("Failed to create media folder in zip")
    }

    for (const id of mediaIds) {
        const asset = await getMediaAsset(id)
        if (!asset) {
            console.warn(`Missing media asset: ${id}`)
            continue
        }

        let ext = ""

        switch (asset.mimeType) {
            case "image/webp":
                ext = ".webp"
                break
        }

        mediaFolder.file(`${id}`, asset.blob)
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    downloadBlob(zipBlob, "board.zip")
}

export async function exportCategory(
    category: CategoryDraft | null,
): Promise<void> {
    if (!category) return

    const mediaIds = collectCategoryMediaIds(category)

    // ---------- Case 1: no media → plain JSON ----------
    if (mediaIds.size === 0) {
        const json = JSON.stringify(category, null, 2)
        const blob = new Blob([json], { type: "application/json" })

        downloadBlob(blob, "category.json")
        return
    }

    // ---------- Case 2: media present → ZIP ----------
    const zip = new JSZip()

    zip.file("category.json", JSON.stringify(category, null, 2))

    const mediaFolder = zip.folder("media")
    if (!mediaFolder) {
        throw new Error("Failed to create media folder in zip")
    }

    for (const id of mediaIds) {
        const asset = await getMediaAsset(id)
        if (!asset) {
            console.warn(`Missing media asset: ${id}`)
            continue
        }

        let ext = ""

        switch (asset.mimeType) {
            case "image/webp":
                ext = ".webp"
                break
        }

        mediaFolder.file(`${id}`, asset.blob)
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    downloadBlob(zipBlob, "category.zip")
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()

    URL.revokeObjectURL(url)
}

function collectMediaIds(board: BoardDraft): Set<string> {
    const ids = new Set<string>()

    for (const category of board.categories) {
        for (const question of category.questions) {
            if (question.questionMedia) {
                ids.add(question.questionMedia.id)
            }
            if (question.answerMedia) {
                ids.add(question.answerMedia.id)
            }
        }
    }

    return ids
}

function collectCategoryMediaIds(category: CategoryDraft): Set<string> {
    const ids = new Set<string>()

    for (const question of category.questions) {
        if (question.questionMedia) {
            ids.add(question.questionMedia.id)
        }
        if (question.answerMedia) {
            ids.add(question.answerMedia.id)
        }
    }

    return ids
}

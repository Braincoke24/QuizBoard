import JSZip from "jszip"
import { fileTypeFromBuffer } from "file-type"
import { putMediaAsset } from "../../media/mediaStore.js"
import type { BoardDraftAction } from "./BoardDraftAction.js"

export async function handleBoardImport(
    event: Event,
    dispatch: (action: BoardDraftAction) => void,
): Promise<void> {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    input.value = ""

    if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        await importFromZip(file, "board", (importJson) =>
            onImportBoard(importJson, dispatch),
        )
    } else {
        const text = await file.text()
        onImportBoard(JSON.parse(text), dispatch)
    }
}

export async function handleCategoryImport(
    event: Event,
    categoryIndex: number,
    dispatch: (action: BoardDraftAction) => void,
): Promise<void> {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    input.value = ""

    if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        await importFromZip(file, "category", (importJson) =>
            onImportCategory(importJson, categoryIndex, dispatch),
        )
    } else {
        const text = await file.text()
        onImportCategory(JSON.parse(text), categoryIndex, dispatch)
    }
}

async function importFromZip(
    file: File,
    jsonName: string,
    onImport: (importJson: unknown) => void,
): Promise<void> {
    const zip = await JSZip.loadAsync(file)

    const jsonFile = zip.file(`${jsonName}.json`)
    if (!jsonFile) {
        throw new Error(`ZIP does not contain ${jsonName}.json`)
    }

    const importJson = JSON.parse(await jsonFile.async("text"))
    onImport(importJson)

    // --- Collect media entries explicitly from zip.files ---
    const allFiles = Object.values(zip.files)

    // filter: must be a file, inside media/ folder
    const mediaEntries = allFiles.filter(
        (entry) => !entry.dir && entry.name.startsWith("media/"),
    )

    if (mediaEntries.length === 0) {
        return
    }

    // safety limits
    const MAX_MEDIA_FILES = 200
    const MAX_SINGLE_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per file
    const ALLOWED_MEDIA_MIME_PREFIXES = ["image/", "audio/"]

    if (mediaEntries.length > MAX_MEDIA_FILES) {
        throw new Error("Import contains too many media files")
    }

    for (const entry of mediaEntries) {
        // entry.name is like "media/<filename>"
        const fileName = entry.name.replace(/^media\//, "")

        // Security: prevent weird paths
        if (fileName.includes("..") || fileName.trim() === "") {
            console.warn("Skipping suspicious media filename:", entry.name)
            continue
        }

        const blob = await entry.async("blob")

        // Size check
        if (blob.size > MAX_SINGLE_FILE_BYTES) {
            console.warn("Skipping oversized media file:", fileName, blob.size)
            continue
        }

        const mime = await getMimeTypeFromZipEntry(entry)

        if (
            !mime ||
            !ALLOWED_MEDIA_MIME_PREFIXES.some((p) => mime.startsWith(p))
        ) {
            console.warn("Skipping unsupported media mime:", fileName, mime)
            continue
        }

        // Use fileName (without folder) as id — you may want to sanitize / namespace
        const id = fileName

        await putMediaAsset({
            id,
            type: mime.startsWith("audio/") ? "audio" : "image",
            mimeType: mime,
            blob,
            size: blob.size,
            createdAt: Date.now(),
        })
    }
}

function onImportBoard(
    json: unknown,
    dispatch: (action: BoardDraftAction) => void,
): void {
    dispatch({ type: "BOARD_DRAFT/IMPORT_BOARD", json })
}

function onImportCategory(
    json: unknown,
    categoryIndex: number,
    dispatch: (action: BoardDraftAction) => void,
): void {
    dispatch({ type: "BOARD_DRAFT/IMPORT_CATEGORY", json, categoryIndex })
}

/**
 * Determines the MIME type of a JSZip file entry
 * by inspecting its binary signature.
 *
 * @param zipFile - A JSZip file object
 * @returns The detected MIME type or null if unknown
 */
async function getMimeTypeFromZipEntry(
    zipFile: JSZip.JSZipObject,
): Promise<string | null> {
    // Read file as Uint8Array
    const content: Uint8Array = await zipFile.async("uint8array")

    // Detect file type from buffer
    const result = await fileTypeFromBuffer(content)

    return result?.mime ?? null
}

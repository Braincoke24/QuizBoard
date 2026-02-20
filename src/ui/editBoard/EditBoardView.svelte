<script lang="ts">
    import { _ } from "svelte-i18n"

    import type { BoardDraft, MediaDraft } from "./BoardDraftState.js"
    import type { BoardDraftAction } from "./BoardDraftAction.js"
    import {
        handleImageFile,
        isAllowedImageFile,
    } from "../shared/media/ImageImporter.js"
    import { getMediaAsset, putMediaAsset } from "../../media/mediaStore.js"
    import { cleanupUnusedMedia } from "../../media/cleanupUnusedMedia.js"
    import JSZip from "jszip"
    import { fileTypeFromBuffer } from "file-type"
    import MediaDraftPreview from "./components/MediaDraftPreview.svelte"
    import { onMount } from "svelte"
    import BoardDraftView from "./components/BoardDraftView.svelte"
    import EditBoardActions from "./components/EditBoardActions.svelte"
    import {
        handleAudioFile,
        isAllowedAudioFile,
    } from "../shared/media/AudioImporter.js"

    let {
        draft = $bindable(),
        warningMessage = $bindable(),
        dispatch,
    }: {
        draft: BoardDraft | null
        warningMessage: string | null
        dispatch: (action: BoardDraftAction) => void
    } = $props()

    let hasSubmitted = $state(false)

    export type MediaPreview = {
        id: string
        categoryIndex: number
        rowIndex: number
        kind: "question" | "answer"
    }

    let mediaPreview: MediaPreview | null = $state(null)

    export type UiValidationErrors = {
        rowValues: boolean[]
        questions: boolean[][]
        categories: boolean[]
    }

    let uiErrors = $derived(validateUi(draft))

    function onSubmitBoard(): void {
        hasSubmitted = true

        const hasErrors =
            uiErrors?.rowValues.some(Boolean) ||
            uiErrors?.categories.some(Boolean) ||
            uiErrors?.questions.some((row) => row.some(Boolean))

        if (hasErrors) return

        dispatch({ type: "BOARD_DRAFT/SUBMIT_BOARD" })
    }

    function onImportBoard(json: unknown): void {
        dispatch({ type: "BOARD_DRAFT/IMPORT_BOARD", json })
    }

    async function onExportBoard(): Promise<void> {
        if (!draft) return

        try {
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
        } catch (error) {
            warningMessage = (error as Error).message
        }
    }

    /**
     * Determines the MIME type of a JSZip file entry
     * by inspecting its binary signature.
     *
     * @param zipFile - A JSZip file object
     * @returns The detected MIME type or null if unknown
     */
    export async function getMimeTypeFromZipEntry(
        zipFile: JSZip.JSZipObject,
    ): Promise<string | null> {
        // Read file as Uint8Array
        const content: Uint8Array = await zipFile.async("uint8array")

        // Detect file type from buffer
        const result = await fileTypeFromBuffer(content)

        return result?.mime ?? null
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

    async function handleBoardImport(event: Event): Promise<void> {
        const input = event.currentTarget as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return

        input.value = ""

        try {
            if (file.type === "application/zip" || file.name.endsWith(".zip")) {
                await importFromZip(file)
            } else {
                const text = await file.text()
                onImportBoard(JSON.parse(text))
            }
        } catch (error) {
            warningMessage = (error as Error).message
        }
    }

    async function importFromZip(file: File): Promise<void> {
        const zip = await JSZip.loadAsync(file)

        const boardFile = zip.file("board.json")
        if (!boardFile) {
            throw new Error("ZIP does not contain board.json")
        }

        const boardJson = JSON.parse(await boardFile.async("text"))
        onImportBoard(boardJson)

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
                console.warn(
                    "Skipping oversized media file:",
                    fileName,
                    blob.size,
                )
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

    async function handleMediaImport(
        event: Event,
        categoryIndex: number,
        rowIndex: number,
        kind: "question" | "answer",
    ): Promise<void> {
        if (!draft) return

        const input = event.currentTarget as HTMLInputElement
        const file = input.files?.[0]

        if (!file) {
            return
        }

        input.value = ""

        let mediaDraft: MediaDraft

        try {
            if (isAllowedImageFile(file)) {
                const id = await handleImageFile(file)

                mediaDraft = {
                    id: id,
                    type: "image",
                }
            } else if (isAllowedAudioFile(file)) {
                const id = await handleAudioFile(file)

                mediaDraft = {
                    id: id,
                    type: "audio",
                }
            } else {
                throw new Error("Unsupported file type")
            }

            if (kind === "question") {
                draft.categories[categoryIndex].questions[
                    rowIndex
                ].questionMedia = mediaDraft
            } else {
                draft.categories[categoryIndex].questions[
                    rowIndex
                ].answerMedia = mediaDraft
            }

            commit()
        } catch (error) {
            warningMessage = (error as Error).message
        }
    }

    function commit(): void {
        const next = JSON.parse(JSON.stringify(draft)) as BoardDraft
        cleanupUnusedMedia(next)
        dispatch({ type: "BOARD_DRAFT/UPDATE_DRAFT", draft: next })
    }

    function validateUi(draft: BoardDraft | null): UiValidationErrors {
        if (!draft) {
            return {
                rowValues: [],
                questions: [],
                categories: [],
            }
        }
        return {
            rowValues: draft.rowValues.map(
                (value) => !Number.isFinite(value) || value < 0,
            ),

            categories: draft.categories.map(
                (category) => category.name.trim().length === 0,
            ),

            questions: draft.categories.map((category) =>
                category.questions.map(
                    (question) => question.text.trim().length === 0,
                ),
            ),
        }
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape" && mediaPreview) {
            mediaPreview = null
        }
    }

    function handleMediaButtonClick(
        id: string,
        categoryIndex: number,
        rowIndex: number,
        kind: "question" | "answer",
    ): void {
        mediaPreview = {
            id,
            categoryIndex,
            rowIndex,
            kind,
        }
    }

    onMount(() => {
        cleanupUnusedMedia(draft)

        window.addEventListener("keydown", handleKeydown)

        return () => {
            window.removeEventListener("keydown", handleKeydown)
        }
    })
</script>

{#if draft}
    <div class="edit-board">
        <div class="board-draft-container" class:has-overlay={mediaPreview}>
            <BoardDraftView
                bind:draft={draft}
                bind:hasSubmitted={hasSubmitted}
                uiErrors={uiErrors}
                commit={commit}
                handleMediaButtonClick={handleMediaButtonClick}
                handleMediaImport={handleMediaImport}
            />
            {#if mediaPreview}
                <div
                    class="board-draft-overlay"
                    role="presentation"
                    tabindex="-1"
                    onclick={(event) => {
                        if (event.target === event.currentTarget) {
                            mediaPreview = null
                        }
                    }}
                >
                    <MediaDraftPreview
                        bind:mediaPreview={mediaPreview}
                        handleMediaImport={handleMediaImport}
                    />
                </div>
            {/if}
        </div>
        <!-- ---------- Actions ---------- -->
        <EditBoardActions
            mediaPreview={mediaPreview}
            commit={commit}
            onExportBoard={onExportBoard}
            onSubmitBoard={onSubmitBoard}
            handleBoardImport={handleBoardImport}
        />
    </div>
{/if}

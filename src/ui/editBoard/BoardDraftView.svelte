<script lang="ts">
    import { _ } from "svelte-i18n"

    import { IMAGE_SVG, IMPORT_SVG } from "../shared/icons.js"
    import type { BoardDraft, MediaDraft } from "./BoardDraftState.js"
    import type { BoardDraftAction } from "./BoardDraftAction.js"
    import { handleImageFile } from "../shared/ImageImporter.js"
    import { getMediaAsset, putMediaAsset } from "../../media/mediaStore.js"
    import { cleanupUnusedMedia } from "../../media/cleanupUnusedMedia.js"
    import JSZip from "jszip"
    import { fileTypeFromBuffer } from "file-type"
    import MediaDraftPreview from "./MediaDraftPreview.svelte"
    import { onMount } from "svelte"

    let {
        draft = $bindable(),
        dispatch,
    }: {
        draft: BoardDraft | null
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

    type UiValidationErrors = {
        rowValues: boolean[]
        questions: boolean[][]
        categories: boolean[]
    }

    let uiErrors = $derived(validateUi(draft))

    function onDraftChange(draft: BoardDraft): void {
        dispatch({ type: "BOARD_DRAFT/UPDATE_DRAFT", draft })
    }

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
            alert((error as Error).message)
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
            alert((error as Error).message)
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

    async function handleImageImport(
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

        try {
            const id = await handleImageFile(file)

            const mediaDraft: MediaDraft = {
                id: id,
                type: "image",
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
            alert((error as Error).message)
        }
    }

    function commit(): void {
        const next = JSON.parse(JSON.stringify(draft)) as BoardDraft
        cleanupUnusedMedia(next)
        onDraftChange(next)
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
            <div class="board-draft">
                <!-- ---------- Header ---------- -->
                <div class="board-draft-header">
                    <div class="board-draft-point-label"></div>

                    {#each draft.categories as category, cIndex}
                        <div class="board-draft-category-container">
                            <input
                                class="board-draft-category"
                                class:error={hasSubmitted &&
                                    uiErrors.categories[cIndex]}
                                type="text"
                                placeholder={$_("board.category_placeholder")}
                                bind:value={category.name}
                                oninput={commit}
                            />

                            <button
                                class="board-draft-category-delete action-button warning"
                                disabled={draft.categories.length <= 1}
                                onclick={() => {
                                    draft.categories.splice(cIndex, 1)
                                    commit()
                                }}
                            >
                                {$_("board.delete_category")}
                            </button>
                        </div>
                    {/each}
                </div>

                <!-- ---------- Grid ---------- -->
                <div class="board-draft-grid">
                    {#each draft.rowValues as rowValue, rowIndex}
                        <div class="board-draft-row">
                            <!-- Row value -->
                            <input
                                class="row-value"
                                class:error={uiErrors.rowValues[rowIndex]}
                                type="number"
                                min="0"
                                bind:value={draft.rowValues[rowIndex]}
                                oninput={commit}
                            />

                            <!-- Questions -->
                            {#each draft.categories as category, cIndex}
                                <div class="board-draft-question-cell">
                                    <textarea
                                        class="board-draft-question-text"
                                        class:error={hasSubmitted &&
                                            uiErrors.questions[cIndex][
                                                rowIndex
                                            ]}
                                        placeholder={$_(
                                            "board.question_placeholder",
                                        )}
                                        bind:value={
                                            category.questions[rowIndex].text
                                        }
                                        oninput={commit}
                                    ></textarea>

                                    {#if category.questions[rowIndex].questionMedia}
                                        <button
                                            class="media-import-button action-button primary"
                                            title={$_("board.open_preview")}
                                            onclick={() => {
                                                const id =
                                                    category.questions[rowIndex]
                                                        .questionMedia!.id
                                                handleMediaButtonClick(
                                                    id,
                                                    cIndex,
                                                    rowIndex,
                                                    "question",
                                                )
                                            }}
                                        >
                                            {#if category.questions[rowIndex].questionMedia.type === "image"}
                                                {@html IMAGE_SVG}
                                            {/if}
                                        </button>
                                    {:else}
                                        <label
                                            class="media-import-button action-button primary"
                                            title={$_("board.upload_media")}
                                        >
                                            {@html IMPORT_SVG}

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                hidden
                                                onchange={(event) =>
                                                    handleImageImport(
                                                        event,
                                                        cIndex,
                                                        rowIndex,
                                                        "question",
                                                    )}
                                            />
                                        </label>
                                    {/if}

                                    <textarea
                                        class="board-draft-question-answer"
                                        placeholder={$_(
                                            "board.answer_placeholder",
                                        )}
                                        bind:value={
                                            category.questions[rowIndex].answer
                                        }
                                        oninput={commit}
                                    ></textarea>

                                    {#if category.questions[rowIndex].answerMedia}
                                        <button
                                            class="media-import-button action-button primary"
                                            title={$_("board.open_preview")}
                                            onclick={() => {
                                                const id =
                                                    category.questions[rowIndex]
                                                        .answerMedia!.id
                                                handleMediaButtonClick(
                                                    id,
                                                    cIndex,
                                                    rowIndex,
                                                    "answer",
                                                )
                                            }}
                                        >
                                            {#if category.questions[rowIndex].answerMedia.type === "image"}
                                                {@html IMAGE_SVG}
                                            {/if}
                                        </button>
                                    {:else}
                                        <label
                                            class="media-import-button action-button primary"
                                            title={$_("board.upload_media")}
                                        >
                                            {@html IMPORT_SVG}

                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                hidden
                                                onchange={(event) =>
                                                    handleImageImport(
                                                        event,
                                                        cIndex,
                                                        rowIndex,
                                                        "answer",
                                                    )}
                                            />
                                        </label>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>

                <!-- ---------- Add category ---------- -->
                <button
                    class="board-draft-category-add action-button accent"
                    title={$_("board.add_category")}
                    disabled={draft.categories.length > 6}
                    onclick={() => {
                        draft.categories[draft.categories.length] = {
                            name: "",
                            questions: draft.rowValues.map(() => ({
                                text: "",
                                answer: "",
                            })),
                        }
                        commit()
                    }}
                >
                    +
                </button>
            </div>
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
                        handleImageImport={handleImageImport}
                    />
                </div>
            {/if}
        </div>
        <!-- ---------- Actions ---------- -->
        <div class="edit-board-actions">
            <button
                class="draft-export-button action-button accent"
                onclick={onExportBoard}
            >
                {$_("board.export")}
            </button>

            <input
                class="draft-import-input"
                type="file"
                accept="application/json,application/zip"
                onchange={handleBoardImport}
            />

            <button
                class="draft-import-button action-button accent"
                onclick={() =>
                    document
                        .querySelector<HTMLInputElement>(".draft-import-input")
                        ?.click()}
            >
                {$_("board.import")}
            </button>

            <button
                class="draft-submit-button action-button accent"
                onclick={() => {
                    commit()
                    onSubmitBoard()
                }}
            >
                {$_("board.submit")}
            </button>
        </div>
    </div>
{/if}

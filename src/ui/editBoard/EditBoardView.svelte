<script lang="ts">
    import { _ } from "svelte-i18n"

    import type { BoardDraft, MediaDraft } from "./BoardDraftState.js"
    import type { BoardDraftAction } from "./BoardDraftAction.js"
    import {
        handleImageFile,
        isAllowedImageFile,
    } from "../shared/media/ImageImporter.js"
    import { cleanupUnusedMedia } from "../../media/cleanupUnusedMedia.js"
    import MediaDraftPreview from "./components/MediaDraftPreview.svelte"
    import { onMount } from "svelte"
    import BoardDraftView from "./components/BoardDraftView.svelte"
    import EditBoardActions from "./components/EditBoardActions.svelte"
    import {
        handleAudioFile,
        isAllowedAudioFile,
    } from "../shared/media/AudioImporter.js"
    import { exportBoard } from "./BoardDraftExport.js"
    import {
        handleBoardImport,
        handleCategoryImport,
    } from "./BoardDraftImport.js"

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
                mediaPreview={mediaPreview}
                commit={commit}
                handleMediaButtonClick={handleMediaButtonClick}
                handleMediaImport={handleMediaImport}
                handleCategoryImport={(event, categoryIndex) =>
                    handleCategoryImport(event, categoryIndex, dispatch)}
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
                        bind:draft={draft}
                        handleMediaImport={handleMediaImport}
                    />
                </div>
            {/if}
        </div>
        <!-- ---------- Actions ---------- -->
        <EditBoardActions
            mediaPreview={mediaPreview}
            commit={commit}
            onExportBoard={() => exportBoard(draft)}
            onSubmitBoard={onSubmitBoard}
            handleBoardImport={(event) => handleBoardImport(event, dispatch)}
        />
    </div>
{/if}

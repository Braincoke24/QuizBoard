<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { BoardDraft } from "../BoardDraftState.js"
    import {
        IMAGE_SVG,
        ADD_FILE_SVG,
        DELETE_SVG,
        SPEAKER_SVG,
    } from "../../shared/icons.js"
    import type {
        MediaPreview,
        UiValidationErrors,
    } from "../EditBoardView.svelte"
    import { exportCategory } from "../BoardDraftExport.js"

    let {
        draft = $bindable(),
        hasSubmitted = $bindable(),
        uiErrors,
        mediaPreview,
        commit,
        handleMediaButtonClick,
        handleMediaImport,
        handleCategoryImport,
    }: {
        draft: BoardDraft
        hasSubmitted: boolean
        uiErrors: UiValidationErrors
        mediaPreview: MediaPreview | null
        commit: () => void
        handleMediaButtonClick: (
            id: string,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => void
        handleMediaImport: (
            event: Event,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => Promise<void>
        handleCategoryImport: (
            event: Event,
            categoryIndex: number,
        ) => Promise<void>
    } = $props()

    let categoryInputs: HTMLInputElement[] = []
</script>

<div class="board-draft">
    <!-- ---------- Header ---------- -->
    <div class="board-draft-header">
        <div class="board-draft-point-label"></div>

        {#each draft.categories as category, cIndex}
            <div class="board-draft-category-container">
                <input
                    class="board-draft-category"
                    class:error={hasSubmitted && uiErrors.categories[cIndex]}
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
                    title={$_("board.delete_category")}
                >
                    {@html DELETE_SVG}
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
                                uiErrors.questions[cIndex][rowIndex]}
                            placeholder={$_("board.question_placeholder")}
                            bind:value={category.questions[rowIndex].text}
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
                                {:else if category.questions[rowIndex].questionMedia.type === "audio"}
                                    {@html SPEAKER_SVG}
                                {/if}
                            </button>
                        {:else}
                            <label
                                class="media-import-button action-button primary"
                                title={$_("board.upload_media")}
                            >
                                {@html ADD_FILE_SVG}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/ogg,audio/webm"
                                    hidden
                                    onchange={(event) =>
                                        handleMediaImport(
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
                            placeholder={$_("board.answer_placeholder")}
                            bind:value={category.questions[rowIndex].answer}
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
                                {:else if category.questions[rowIndex].answerMedia.type === "audio"}
                                    {@html SPEAKER_SVG}
                                {/if}
                            </button>
                        {:else}
                            <label
                                class="media-import-button action-button primary"
                                title={$_("board.upload_media")}
                            >
                                {@html ADD_FILE_SVG}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/ogg,audio/webm"
                                    hidden
                                    onchange={(event) =>
                                        handleMediaImport(
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
    <!-- ---------- Footer ---------- -->
    <div class="board-draft-footer">
        <div class="board-draft-point-label"></div>

        {#each draft.categories as category, cIndex}
            <div class="board-draft-category-io">
                <button
                    class="category-draft-export-button action-button accent"
                    disabled={mediaPreview !== null}
                    onclick={() => exportCategory(category)}
                >
                    {$_("board.export_category")}
                </button>

                <label
                    class="category-draft-import-button action-button accent"
                >
                    {$_("board.import_category")}

                    <input
                        type="file"
                        accept="application/json,application/zip"
                        hidden
                        onchange={(event) => {
                            console.log(cIndex)
                            handleCategoryImport(event, cIndex)
                        }}
                    />
                </label>
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

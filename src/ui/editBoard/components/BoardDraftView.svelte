<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { BoardDraft } from "../BoardDraftState.js"
    import { IMAGE_SVG, IMPORT_SVG } from "../../shared/icons.js"
    import type { UiValidationErrors } from "../EditBoardView.svelte"

    let {
        draft = $bindable(),
        hasSubmitted = $bindable(),
        uiErrors,
        commit,
        handleMediaButtonClick,
        handleImageImport,
    }: {
        draft: BoardDraft
        hasSubmitted: boolean
        uiErrors: UiValidationErrors
        commit: () => void
        handleMediaButtonClick: (
            id: string,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => void
        handleImageImport: (
            event: Event,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => Promise<void>
    } = $props()
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

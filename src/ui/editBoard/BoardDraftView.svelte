<script lang="ts">
    import type { Writable } from "svelte/store"
    import type { BoardDraft } from "./BoardDraftState.js"

    export let draft: Writable<BoardDraft | null>

    export let onDraftChange: (draft: BoardDraft) => void
    export let onSubmitBoard: () => void
    export let onImportBoard: (json: unknown) => void
    export let onExportBoard: () => void

    /**
     * Commit helper:
     * Always send a cloned snapshot back to the app.
     */
    function commit(next: BoardDraft): void {
        onDraftChange(structuredClone(next))
    }

    function handleImport(event: Event): void {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return

        file.text()
            .then((text) => onImportBoard(JSON.parse(text)))
            .catch((error) => {
                alert(
                    error instanceof SyntaxError
                        ? "Invalid JSON file"
                        : (error as Error).message,
                )
            })
            .finally(() => {
                input.value = ""
            })
    }
</script>

{#if $draft}
    <div class="board-draft">
        <!-- ---------- Header ---------- -->
        <div class="board-draft-header">
            <div class="board-draft-point-label"></div>

            {#each $draft.categories as category, cIndex}
                <div class="board-draft-category-container">
                    <input
                        class="board-draft-category"
                        type="text"
                        placeholder="Category"
                        value={category.name}
                        on:input={(e) => {
                            const next = structuredClone($draft)
                            next.categories[cIndex].name = (
                                e.target as HTMLInputElement
                            ).value
                            commit(next)
                        }}
                    />

                    <button
                        class="board-draft-category-delete action-button warning"
                        disabled={$draft.categories.length <= 1}
                        on:click={() => {
                            const next = {
                                ...$draft,
                                categories: $draft.categories.filter(
                                    (_, i) => i !== cIndex,
                                ),
                            }
                            commit(next)
                        }}
                    >
                        Delete
                    </button>
                </div>
            {/each}
        </div>

        <!-- ---------- Grid ---------- -->
        <div class="board-draft-grid">
            {#each $draft.rowValues as rowValue, rowIndex}
                <div class="board-draft-row">
                    <!-- Row value -->
                    <input
                        class="row-value"
                        type="number"
                        min="0"
                        value={rowValue}
                        on:input={(e) => {
                            const next = structuredClone($draft)
                            next.rowValues[rowIndex] = Number(
                                (e.target as HTMLInputElement).value,
                            )
                            commit(next)
                        }}
                    />

                    <!-- Questions -->
                    {#each $draft.categories as category, cIndex}
                        <div class="board-draft-question-cell">
                            <textarea
                                class="board-draft-question-text"
                                placeholder="Question"
                                value={category.questions[rowIndex].text}
                                on:input={(e) => {
                                    const next = structuredClone($draft)
                                    next.categories[cIndex].questions[
                                        rowIndex
                                    ].text = (
                                        e.target as HTMLTextAreaElement
                                    ).value
                                    commit(next)
                                }}
                            ></textarea>

                            <textarea
                                class="board-draft-question-answer"
                                placeholder="Answer (optional)"
                                value={category.questions[rowIndex].answer}
                                on:input={(e) => {
                                    const next = structuredClone($draft)
                                    next.categories[cIndex].questions[
                                        rowIndex
                                    ].answer = (
                                        e.target as HTMLTextAreaElement
                                    ).value
                                    commit(next)
                                }}
                            ></textarea>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>

        <!-- ---------- Add category ---------- -->
        <button
            class="board-draft-category-add action-button accent"
            title="Add category"
            disabled={$draft.categories.length > 6}
            on:click={() => {
                const next = {
                    ...$draft,
                    categories: [
                        ...$draft.categories,
                        {
                            name: "",
                            questions: $draft.rowValues.map(() => ({
                                text: "",
                                answer: "",
                            })),
                        },
                    ],
                }
                commit(next)
            }}
        >
            +
        </button>
    </div>

    <!-- ---------- Actions ---------- -->
    <div class="edit-board-actions">
        <button
            class="draft-export-button action-button accent"
            on:click={onExportBoard}
        >
            Export
        </button>

        <input
            class="draft-import-input"
            type="file"
            accept="application/json"
            on:change={handleImport}
        />

        <button
            class="draft-import-button action-button accent"
            on:click={() =>
                document
                    .querySelector<HTMLInputElement>(".draft-import-input")
                    ?.click()}
        >
            Import
        </button>

        <button
            class="draft-submit-button action-button accent"
            on:click={() => {
                commit($draft)
                onSubmitBoard()
            }}
        >
            Submit
        </button>
    </div>
{/if}

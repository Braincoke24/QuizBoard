<script lang="ts">
    import { _ } from "svelte-i18n"

    import type { BoardDraft } from "./BoardDraftState.js"
    import type { BoardDraftAction } from "./BoardDraftAction.js"

    let {
        draft = $bindable(),
        dispatch,
    }: {
        draft: BoardDraft | null
        dispatch: (action: BoardDraftAction) => void
    } = $props()

    let hasSubmitted = $state(false)

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

    function onExportBoard(): void {
        try {
            const json = JSON.stringify(draft, null, 2)
            const blob = new Blob([json], {
                type: "application/json",
            })
            const url = URL.createObjectURL(blob)

            const a = document.createElement("a")
            a.href = url
            a.download = "board.json"
            a.click()

            URL.revokeObjectURL(url)
        } catch (error) {
            alert((error as Error).message)
        }
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
                        ? $_("board.invalid_json")
                        : (error as Error).message,
                )
            })
            .finally(() => {
                input.value = ""
            })
    }

    function commit(): void {
        const next = JSON.parse(JSON.stringify(draft)) as BoardDraft
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
</script>

{#if draft}
    <div class="edit-board">
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
                                        uiErrors.questions[cIndex][rowIndex]}
                                    placeholder={$_(
                                        "board.question_placeholder",
                                    )}
                                    bind:value={
                                        category.questions[rowIndex].text
                                    }
                                    oninput={commit}
                                ></textarea>

                                <textarea
                                    class="board-draft-question-answer"
                                    placeholder={$_("board.answer_placeholder")}
                                    bind:value={
                                        category.questions[rowIndex].answer
                                    }
                                    oninput={commit}
                                ></textarea>
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
                accept="application/json"
                onchange={handleImport}
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

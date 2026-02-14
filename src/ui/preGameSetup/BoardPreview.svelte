<script lang="ts">
    import type { BoardDraft } from "../editBoard/BoardDraftState.js"
    export let board: BoardDraft
</script>

<div class="board-container">
    <div class="board">
        <div class="board-header">
            {#each board.categories as category}
                <div>{category.name}</div>
            {/each}
        </div>

        {#each board.rowValues as value, rowIndex}
            <div class="board-row">
                {#each board.categories as category}
                    <div class="question-cell">
                        {category.questions[rowIndex] ? value : ""}
                    </div>
                {/each}
            </div>
        {/each}
    </div>
</div>
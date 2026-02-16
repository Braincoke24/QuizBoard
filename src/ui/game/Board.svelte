<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { GameUISnapshot } from "./state/GameUISnapshot.js"
    import { TurnState } from "../../game/turn/TurnState.js"

    let {
        snapshot = $bindable(),
        profile,
        onSelectQuestion,
        onAnswer,
        onPass,
        onContinue,
    }: {
        snapshot: GameUISnapshot
        profile: UIViewProfile
        onSelectQuestion: (c: number, r: number) => void
        onAnswer: (isCorrect: boolean) => void
        onPass: () => void
        onContinue: () => void
    } = $props()

    let maxRows = $derived(
        Math.max(
            0,
            ...snapshot.board.map((category) => category.questions.length),
        ),
    )
</script>

<div
    class="board-container
    {snapshot.activeQuestion === null ? '' : 'has-overlay'}"
>
    <div class="board">
        <div class="board-header">
            {#each snapshot.board as category}
                <div>{category.name}</div>
            {/each}
        </div>

        {#each Array(maxRows) as _, rowIndex}
            <div class="board-row">
                {#each snapshot.board as category, cIndex}
                    {#if category.questions[rowIndex]}
                        <button
                            class="question-cell
                                {category.questions[rowIndex].isAvailable
                                ? ''
                                : 'used'}"
                            disabled={!category.questions[rowIndex]
                                .isAvailable ||
                                !profile.capabilities.canSelectQuestion ||
                                snapshot.turnState !== TurnState.SELECTING}
                            onclick={() => onSelectQuestion(cIndex, rowIndex)}
                        >
                            {category.questions[rowIndex].value.toString()}
                        </button>
                    {:else}
                        <div class="question-cell empty"></div>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
    {#if snapshot.activeQuestion !== null}
        <div class="active-question-overlay">
            <div class="active-question">
                <div class="active-question-category">
                    {snapshot.activeQuestion.categoryName}
                </div>
                <div class="active-question-value">
                    {snapshot.activeQuestion.value.toString()}
                </div>
                <div class="active-question-text">
                    {snapshot.activeQuestion.text}
                </div>
                {#if profile.visibility.showCorrectAnswer || snapshot.turnState === TurnState.RESOLVING}
                    <div class="active-question-answer">
                        {$_("game.answer") +
                            ": " +
                            snapshot.activeQuestion.answer}
                    </div>
                {/if}
            </div>
            <div class="active-question-controls">
                {#if profile.capabilities.canJudgeAnswer}
                    <button
                        class="correct action-button accent
                            {snapshot.canAnswer ? '' : 'hidden'}"
                        disabled={!snapshot.canAnswer}
                        onclick={() => onAnswer(true)}
                    >
                        {$_("game.correct")}
                    </button>
                    <button
                        class="wrong action-button accent
                            {snapshot.canAnswer ? '' : 'hidden'}"
                        disabled={!snapshot.canAnswer}
                        onclick={() => onAnswer(false)}
                    >
                        {$_("game.wrong")}
                    </button>
                {/if}
                {#if profile.capabilities.canPass}
                    <button
                        class="pass action-button accent
                            {snapshot.canPass ? '' : 'hidden'}"
                        disabled={!snapshot.canPass}
                        onclick={onPass}
                    >
                        {$_("game.pass")}
                    </button>
                {/if}
                {#if profile.capabilities.canContinue}
                    <button
                        class="continue action-button accent
                            {snapshot.canContinue ? '' : 'hidden'}"
                        disabled={!snapshot.canContinue}
                        onclick={onContinue}
                    >
                        {$_("game.continue")}
                    </button>
                {/if}
            </div>
        </div>
    {/if}
</div>

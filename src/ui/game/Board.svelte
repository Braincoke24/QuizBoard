<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { GameUISnapshot } from "./state/GameUISnapshot.js"
    import { TurnPhase } from "../../game/turn/TurnPhase.js"
    import MediaAsset from "../shared/media/MediaAsset.svelte"

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

<div class="board-container" class:has-overlay={snapshot.activeQuestion}>
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
                            class="question-cell"
                            class:used={!category.questions[rowIndex]
                                .isAvailable}
                            disabled={!category.questions[rowIndex]
                                .isAvailable ||
                                !profile.capabilities.canSelectQuestion ||
                                snapshot.turnPhase !== TurnPhase.SELECTING}
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
            <div
                class="active-question"
                class:has-media={(snapshot.turnPhase === TurnPhase.RESOLVING &&
                    snapshot.activeQuestion.answerMedia) ||
                    snapshot.activeQuestion.questionMedia}
            >
                <div class="active-question-category">
                    {snapshot.activeQuestion.categoryName}
                </div>
                <div class="active-question-value">
                    {snapshot.activeQuestion.value.toString()}
                </div>
                {#if snapshot.turnPhase === TurnPhase.RESOLVING && snapshot.activeQuestion.answerMedia}
                    <MediaAsset id={snapshot.activeQuestion.answerMedia.id} />
                {:else if snapshot.activeQuestion.questionMedia}
                    <MediaAsset id={snapshot.activeQuestion.questionMedia.id} />
                {/if}
                <div class="active-question-text">
                    {snapshot.activeQuestion.text}
                </div>
                {#if profile.visibility.showCorrectAnswer || snapshot.turnPhase === TurnPhase.RESOLVING}
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
                        class="correct action-button accent"
                        class:hidden={!snapshot.canAnswer}
                        disabled={!snapshot.canAnswer}
                        onclick={() => onAnswer(true)}
                    >
                        {$_("game.correct")}
                    </button>
                    <button
                        class="wrong action-button accent"
                        class:hidden={!snapshot.canAnswer}
                        disabled={!snapshot.canAnswer}
                        onclick={() => onAnswer(false)}
                    >
                        {$_("game.wrong")}
                    </button>
                {/if}
                {#if profile.capabilities.canPass}
                    <button
                        class="pass action-button accent"
                        class:hidden={!snapshot.canPass}
                        disabled={!snapshot.canPass}
                        onclick={onPass}
                    >
                        {$_("game.pass")}
                    </button>
                {/if}
                {#if profile.capabilities.canContinue}
                    <button
                        class="continue action-button accent"
                        class:hidden={!snapshot.canContinue}
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

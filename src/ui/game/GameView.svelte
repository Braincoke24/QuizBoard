<script lang="ts">
    import { onMount, onDestroy } from "svelte"

    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { GameUISnapshot } from "./state/GameUISnapshot.js"
    import type { GameAction } from "./GameAction.js"

    import PlayersPanel from "./PlayersPanel.svelte"
    import Board from "./Board.svelte"
    import { keyCodeNameMap } from "../shared/KeyCodeNameMap.js"

    let {
        snapshot = $bindable(),
        profile,
        dispatch,
    }: {
        snapshot: GameUISnapshot | null
        profile: UIViewProfile
        dispatch: (action: GameAction) => void
    } = $props()

    function onSelectQuestion(
        categoryIndex: number,
        questionIndex: number,
    ): void {
        dispatch({
            type: "GAME/SELECT_QUESTION",
            categoryIndex,
            questionIndex,
        })
    }

    function onBuzz(playerId: string): void {
        dispatch({ type: "GAME/BUZZ", playerId })
    }

    function onAnswer(correct: boolean): void {
        dispatch({ type: "GAME/ANSWER", correct })
    }

    function onPass(): void {
        dispatch({ type: "GAME/PASS" })
    }

    function onContinue(): void {
        dispatch({ type: "GAME/CONTINUE" })
    }

    function keyHandler(e: KeyboardEvent): void {
        if (e.metaKey || e.altKey || e.ctrlKey || e.key.length !== 1) {
            return
        }

        e.preventDefault()
        dispatch({
            type: "GAME/PRESS_KEY",
            key: keyCodeNameMap(e.code),
        })
    }

    onMount(() => {
        window.addEventListener("keydown", keyHandler)
        onDestroy(() => {
            window.removeEventListener("keydown", keyHandler)
        })
    })
</script>

{#if snapshot}
    <div class="game-running">
        <PlayersPanel
            profile={profile}
            players={snapshot.players}
            canBuzzIds={snapshot.canBuzz}
            onBuzz={onBuzz}
        />

        <Board
            snapshot={snapshot}
            profile={profile}
            onSelectQuestion={onSelectQuestion}
            onAnswer={onAnswer}
            onPass={onPass}
            onContinue={onContinue}
        />
    </div>
{/if}

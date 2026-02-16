<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { PlayerUIState } from "../game/state/GameUIState.js"
    import type { GameEndAction } from "./GameEndAction.js"

    let {
        players,
        dispatch,
    }: {
        players: readonly PlayerUIState[] | undefined
        dispatch: (action: GameEndAction) => void
    } = $props()

    const FIGURE_SPACE = "\u2007"

    function onStartNewGame(): void {
        dispatch({ type: "GAME_ENDED/START_NEW_GAME" })
    }

    function scoreToAlignedString(score: number, l: number = 5): string {
        const scoreLength = Math.max(
            Math.floor(Math.log10(Math.abs(score))) + 1,
            1,
        )

        let res = FIGURE_SPACE.repeat(l - scoreLength - 1) + score.toString()

        if (score >= 0) {
            res = FIGURE_SPACE + res
        }

        return res
    }

    function sortedPlayers(list: readonly PlayerUIState[]): PlayerUIState[] {
        return [...list].sort((a, b) => b.score - a.score)
    }
</script>

<div class="game-ended">
    {#if players}
        <div class="scoreboard">
            <div class="scoreboard-label">{$_("game_ended.results")}</div>

            {#each sortedPlayers(players) as player, index}
                <div class="scoreboard-player-cell">
                    <div
                        class="scoreboard-player-rank
                {index === 0 ? 'rank-1' : ''}
                {index === 1 ? 'rank-2' : ''}
                {index === 2 ? 'rank-3' : ''}"
                    >
                        {index + 1}
                    </div>

                    <div class="scoreboard-player-name">
                        {player.name}
                    </div>

                    <div class="scoreboard-player-score">
                        {scoreToAlignedString(player.score)}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
    <div class="game-ended-actions">
        <button
            class="start-new-game-button action-button accent"
            onclick={onStartNewGame}
        >
            {$_("game_ended.start_new_game")}
        </button>
    </div>
</div>

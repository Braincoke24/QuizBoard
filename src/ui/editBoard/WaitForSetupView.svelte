<script lang="ts">
    import type { PlayerUIState } from "../game/state/GameUIState.js"

    let { players }: { players: readonly PlayerUIState[] | undefined } =
        $props()

    const FIGURE_SPACE = "\u2007"

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

<div class="wait-for-setup">
    <div class="wait-for-setup-message">
        Waiting for gamemaster to setup the game...
    </div>

    {#if players && players.length > 0}
        <div class="scoreboard">
            <div class="scoreboard-label">Results</div>

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
</div>

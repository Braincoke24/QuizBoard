<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { PlayerUIState } from "./state/GameUIState.js"

    let {
        profile,
        players,
        canBuzzIds,
        onBuzz,
    }: {
        profile: UIViewProfile
        players: readonly PlayerUIState[]
        canBuzzIds: readonly string[]
        onBuzz: (playerId: string) => void
    } = $props()
</script>

<div class="player-list">
    {#each players as player}
        <div
            class="player-cell"
            class:active={player.isActive}
            class:locked={player.isLockedOut}
        >
            <div class="player-name">{player.name}</div>
            <div class="player-score">{player.score.toString()}</div>
            {#if profile.capabilities.canBuzz}
                <button
                    class="buzz-button action-button accent"
                    onclick={() => onBuzz(player.id)}
                    disabled={!canBuzzIds.includes(player.id)}
                >
                    {$_("game.buzz")}
                </button>
            {/if}
        </div>
    {/each}
</div>

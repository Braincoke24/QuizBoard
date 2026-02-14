<script lang="ts">
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { PlayerUIState } from "./state/GameUIState.js"

    export let profile: UIViewProfile
    export let players: readonly PlayerUIState[]
    export let canBuzzIds: readonly string[]

    export let onBuzz: (playerId: string) => void
</script>

<div class="player-list">
    {#each players as player}
        <div
            class="player-cell
                {player.isActive ? "active" : ""}
                {player.isLockedOut ? "locked" : ""}"
        >
            <div class="player-name">{player.name}</div>
            <div class="player-score">{player.score.toString()}</div>
            {#if profile.capabilities.canBuzz}
                <button
                    class="buzz-button action-button accent"
                    on:click={() => onBuzz(player.id)}
                    disabled={!canBuzzIds.includes(player.id)}
                >
                    Buzz
                </button>
            {/if}
        </div>
    {/each}
</div>
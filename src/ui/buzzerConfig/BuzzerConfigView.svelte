<script lang="ts">
    import type { Writable } from "svelte/store"
    import type { BuzzerConfigSnapshot } from "./BuzzerConfigState.js";

    export let snapshot: Writable<BuzzerConfigSnapshot | null>

    export let onSkip: () => void
</script>

{#if $snapshot}
    <div class="buzzer-config-title">
        {$snapshot.done
            ? "Buzzer configuration complete"
            : `Press a key for: ${$snapshot.players[$snapshot.currentIndex].name}`}
    </div>
    <div class="buzzer-config-player-list">
        {#each $snapshot.players as player, pIndex}
            <div
                class="buzzer-config-player-row
                {(pIndex === $snapshot.currentIndex && !$snapshot.done) ? "active" : ""}"
            >
                <div class="buzzer-config-player-name">{player.name}</div>
                <div class="buzzer-config-key">{$snapshot.assignedKeys[player.id] ?? "—"}</div>
            </div>
        {/each}
    </div>
    <div class="buzzer-config-actions">
        {#if !$snapshot.done}
            <button
                class="action-button accent"
                on:click={onSkip}
            >
                Skip
            </button>
        {/if}
    </div>
{/if}
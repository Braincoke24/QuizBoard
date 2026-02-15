<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { PlayerConfig } from "./PreGameSetupState.js"

    export let players: readonly PlayerConfig[]
    export let onAddPlayer: (name: string) => void
    export let onRemovePlayer: (id: string) => void

    let newPlayerName = ""
</script>

<div class="player-list">
    <div class="player-header">
        <div class="player-title">{$_("player_panel.title")}</div>
        <div class="player-counter">{players.length}/6</div>
    </div>

    {#if players.length < 6}
        <form
            class="player-cell"
            on:submit|preventDefault={() => {
                const name = newPlayerName.trim()
                if (!name) return
                onAddPlayer(name)
                newPlayerName = ""
            }}
        >
            <input
                class="player-name"
                type="text"
                placeholder={$_("player_panel.name_placeholder")}
                maxlength="16"
                bind:value={newPlayerName}
            />

            <button
                class="player-add action-button accent"
                type="submit"
                disabled={!newPlayerName.trim()}
            >
                {$_("player_panel.add")}
            </button>
        </form>
    {/if}

    {#each players as player}
        <div class="player-cell">
            <div class="player-name">{player.name}</div>
            <button
                class="player-delete action-button warning"
                on:click={() => onRemovePlayer(player.id)}
            >
                {$_("player_panel.delete")}
            </button>
        </div>
    {/each}
</div>

<script lang="ts">
    import { _ } from "svelte-i18n"
    import { onMount, onDestroy } from "svelte"

    import type { BuzzerConfigSnapshot } from "./BuzzerConfigState.js"
    import type { BuzzerConfigAction } from "./BuzzerConfigAction.js"

    import { keyCodeNameMap } from "../shared/KeyCodeNameMap.js"

    let {
        snapshot = $bindable(),
        dispatch,
    }: {
        snapshot: BuzzerConfigSnapshot | null
        dispatch: (action: BuzzerConfigAction) => void
    } = $props()

    function onSkip(): void {
        dispatch({ type: "BUZZER_CONFIG/SKIP_PLAYER" })
    }

    function keyHandler(e: KeyboardEvent): void {
        if (e.metaKey || e.altKey || e.ctrlKey || e.key.length !== 1) {
            return
        }

        e.preventDefault()
        dispatch({
            type: "BUZZER_CONFIG/ASSIGN_KEY",
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
    <div class="buzzer-config">
        <div class="buzzer-config-title">
            {snapshot.done
                ? $_("buzzer_config.config_complete")
                : $_("buzzer_config.press_key", {
                      values: {
                          name: snapshot.players[snapshot.currentIndex].name,
                      },
                  })}
        </div>
        <div class="buzzer-config-player-list">
            {#each snapshot.players as player, pIndex}
                <div
                    class="buzzer-config-player-row
                {pIndex === snapshot.currentIndex && !snapshot.done
                        ? 'active'
                        : ''}"
                >
                    <div class="buzzer-config-player-name">{player.name}</div>
                    <div class="buzzer-config-key">
                        {snapshot.assignedKeys[player.id] ?? "—"}
                    </div>
                </div>
            {/each}
        </div>
        <div class="buzzer-config-actions">
            {#if !snapshot.done}
                <button class="action-button accent" onclick={onSkip}>
                    {$_("buzzer_config.skip")}
                </button>
            {/if}
        </div>
    </div>
{/if}

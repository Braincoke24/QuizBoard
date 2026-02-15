<script lang="ts">
    import { _ } from "svelte-i18n"
    import {
        MULTIPLIER_KEYS,
        type MultiplierKey,
        type PreGameSetup,
    } from "./PreGameSetupState.js"
    import { GAME_RULE_PRESETS } from "../../game/GameRulePresets.js"
    import { INFO_ICON_SVG } from "../shared/icons.js"
    import {
        WINDOW_MODES,
        BUZZER_MODES,
        type WindowMode,
        type BuzzerMode,
    } from "./PreGameSetupState.js"

    export let setup: PreGameSetup

    export let onSelectRule: (ruleId: string) => void
    export let onUpdateMultiplier: (key: MultiplierKey, value: number) => void
    export let onSetBuzzerMode: (mode: BuzzerMode) => void
    export let onStartGame: (mode: WindowMode) => void

    let selectedWindowMode: WindowMode = "current"

    $: preset = GAME_RULE_PRESETS.find((p) => p.id === setup.selectedRuleId)!

    $: rules = preset.editable ? setup.customMultipliers : preset.rules
</script>

<div class="game-options">
    <div class="game-rules">
        <div class="game-rules-title">
            {$_("game_options.multipliers.title")}
        </div>

        <div class="rule-tabs">
            {#each GAME_RULE_PRESETS as p}
                <button
                    class:selected={p.id === setup.selectedRuleId}
                    on:click={() => onSelectRule(p.id)}
                >
                    {$_(`game_options.multipliers.name.${p.id}`)}
                </button>
            {/each}
        </div>

        <div class="rule-details">
            {#each MULTIPLIER_KEYS as key}
                <div class="multiplier-row">
                    <span class="multiplier-label">
                        {$_(`game_options.multipliers.${key}.label`)}
                        <span
                            class="info-icon"
                            data-tooltip={$_(
                                `game_options.multipliers.${key}.tooltip`,
                            )}
                        >
                            {@html INFO_ICON_SVG}
                        </span>
                    </span>

                    {#if preset.editable}
                        <input
                            class="multiplier-value"
                            type="number"
                            min="0"
                            value={rules[key]}
                            on:change={(e) =>
                                onUpdateMultiplier(
                                    key,
                                    Number(
                                        (e.target as HTMLInputElement).value,
                                    ),
                                )}
                        />
                    {:else}
                        <span class="multiplier-value">
                            {rules[key]}
                        </span>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="buzzer-mode">
        <div class="buzzer-mode-title">
            {$_("game_options.buzzer_mode.title")}
        </div>
        <div class="buzzer-mode-container">
            {#each BUZZER_MODES as mode}
                <button
                    class:selected={setup.buzzerMode === mode}
                    class="action-button"
                    on:click={() => onSetBuzzerMode(mode)}
                >
                    {$_(`game_options.buzzer_mode.${mode}`)}
                </button>
            {/each}
        </div>
    </div>

    <div class="window-mode">
        <div class="window-mode-title">
            {$_("game_options.window_mode.title")}
        </div>

        {#each WINDOW_MODES as wm}
            <div class="window-mode-container">
                <button
                    class:selected={selectedWindowMode === wm}
                    class="window-mode-button action-button"
                    on:click={() => (selectedWindowMode = wm)}
                >
                    {$_(`game_options.window_mode.${wm}.name`)}
                </button>
                <div class="window-mode-desc">
                    {$_(`game_options.window_mode.${wm}.short_desc`)}
                </div>
                <span
                    class="info-icon"
                    data-tooltip={$_(
                        `game_options.window_mode.${wm}.long_desc`,
                    )}
                >
                    {@html INFO_ICON_SVG}
                </span>
            </div>
        {/each}
    </div>

    <div class="game-start-container">
        <button
            class="game-start-button action-button accent"
            disabled={setup.players.length === 0}
            on:click={() => onStartGame(selectedWindowMode)}
        >
            {$_("game_options.start_game")}
        </button>
    </div>
</div>

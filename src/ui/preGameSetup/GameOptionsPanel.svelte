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

    let {
        setup,
        onSelectRule,
        onUpdateMultiplier,
        onSetBuzzerMode,
        onStartGame,
    }: {
        setup: PreGameSetup
        onSelectRule: (ruleId: string) => void
        onUpdateMultiplier: (key: MultiplierKey, value: number) => void
        onSetBuzzerMode: (mode: BuzzerMode) => void
        onStartGame: (mode: WindowMode) => void
    } = $props()

    let selectedWindowMode: WindowMode = $state("current")

    let preset = $derived(
        GAME_RULE_PRESETS.find((p) => p.id === setup.selectedRuleId)!,
    )
    let rules = $derived(
        preset.editable ? setup.customMultipliers : preset.rules,
    )

    // TODO: postion tooltips better (possibly with tippy)
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
                    onclick={() => onSelectRule(p.id)}
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
                            onchange={(e) =>
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
                    onclick={() => onSetBuzzerMode(mode)}
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
                    onclick={() => (selectedWindowMode = wm)}
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
            onclick={() => onStartGame(selectedWindowMode)}
        >
            {$_("game_options.start_game")}
        </button>
    </div>
</div>

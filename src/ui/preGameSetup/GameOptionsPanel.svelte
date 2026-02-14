<script lang="ts">
    import type { PreGameSetup } from "./PreGameSetupState.js"
    import type { GameRulePreset } from "../../game/GameRulePresets.js"
    import { INFO_ICON_SVG } from "../shared/icons.js"

    type MultiplierKey =
        | "firstWrongMultiplier"
        | "buzzCorrectMultiplier"
        | "buzzWrongMultiplier"

    type WindowMode = "single" | "dual" | "keep-current"

    export let setup: PreGameSetup
    export let presets: readonly GameRulePreset[]

    export let onSelectRule: (ruleId: string) => void
    export let onUpdateMultiplier: (key: MultiplierKey, value: number) => void
    export let onSetBuzzerMode: (
        mode: "mouse-only" | "mouse-and-keyboard",
    ) => void
    export let onStartGame: (mode: WindowMode) => void

    let selectedWindowMode: WindowMode = "keep-current"

    $: preset = presets.find((p) => p.id === setup.selectedRuleId)!

    $: rules = preset.editable ? setup.customMultipliers : preset.rules

    const buzzerModes: readonly ("mouse-only" | "mouse-and-keyboard")[] = [
        "mouse-only",
        "mouse-and-keyboard",
    ]

    const ruleDetailRows: {
        key: MultiplierKey
        label: string
        tooltip: string
    }[] = [
        {
            key: "firstWrongMultiplier",
            label: "Initial wrong",
            tooltip: "Applied when the first player answers incorrectly",
        },
        {
            key: "buzzCorrectMultiplier",
            label: "Buzzed correct",
            tooltip: "Applied when a buzzing player answers correctly",
        },
        {
            key: "buzzWrongMultiplier",
            label: "Buzzed wrong",
            tooltip: "Applied when a buzzing player answers incorrectly",
        },
    ]

    const windowModes: {
        name: string
        shortDesc: string
        longDesc: string
        mode: WindowMode
    }[] = [
        {
            name: "Single",
            shortDesc: "One shared screen",
            longDesc:
                "Players and gamemaster share one display. Answers are hidden until the question is answered or skipped.",
            mode: "single",
        },
        {
            name: "Dual",
            shortDesc: "Separate windows",
            longDesc:
                "Opens a second window for display only (projector / second screen). The game can only be controlled from the gamemaster window.",
            mode: "dual",
        },
        {
            name: "Current",
            shortDesc: "Use existing setup",
            longDesc:
                "Use this if you already have two windows open and configured.",
            mode: "keep-current",
        },
    ]
</script>

<div class="game-options">
    <div class="game-rules">
        <div class="game-rules-title">Multipliers</div>

        <div class="rule-tabs">
            {#each presets as p}
                <button
                    class:selected={p.id === setup.selectedRuleId}
                    on:click={() => onSelectRule(p.id)}
                >
                    {p.label}
                </button>
            {/each}
        </div>

        <div class="rule-details">
            {#each ruleDetailRows as row}
                <div class="multiplier-row">
                    <span class="multiplier-label">
                        {row.label}
                        <span class="info-icon" data-tooltip={row.tooltip}>
                            {@html INFO_ICON_SVG}
                        </span>
                    </span>

                    {#if preset.editable}
                        <input
                            class="multiplier-value"
                            type="number"
                            min="0"
                            value={rules[row.key]}
                            on:change={(e) =>
                                onUpdateMultiplier(
                                    row.key,
                                    Number(
                                        (e.target as HTMLInputElement).value,
                                    ),
                                )}
                        />
                    {:else}
                        <span class="multiplier-value">
                            {rules[row.key]}
                        </span>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="buzzer-mode">
        <div class="buzzer-mode-title">Buzzer mode</div>
        <div class="buzzer-mode-container">
            {#each buzzerModes as mode}
                <button
                    class:selected={setup.buzzerMode === mode}
                    class="action-button"
                    on:click={() => onSetBuzzerMode(mode)}
                >
                    {mode === "mouse-only" ? "Mouse" : "Keyboard"}
                </button>
            {/each}
        </div>
    </div>

    <div class="window-mode">
        <div class="window-mode-title">Window mode</div>

        {#each windowModes as wm}
            <div class="window-mode-container">
                <button
                    class:selected={selectedWindowMode === wm.mode}
                    class="window-mode-button action-button"
                    on:click={() => (selectedWindowMode = wm.mode)}
                >
                    {wm.name}
                </button>
                <div class="window-mode-desc">{wm.shortDesc}</div>
                <span class="info-icon" data-tooltip={wm.longDesc}>
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
            Start game
        </button>
    </div>
</div>

<script lang="ts">
    import type { Writable } from "svelte/store"
    import type { PreGameSetup } from "./PreGameSetupState.js"
    import type { GameRulePreset } from "../../game/GameRulePresets.js"

    import PlayersPanel from "./PlayersPanel.svelte"
    import BoardPreview from "./BoardPreview.svelte"
    import GameOptionsPanel from "./GameOptionsPanel.svelte"

    export let setup: Writable<PreGameSetup | null>
    export let presets: readonly GameRulePreset[]

    export let onAddPlayer: (name: string) => void
    export let onRemovePlayer: (id: string) => void
    export let onSelectRule: (ruleId: string) => void
    export let onUpdateMultiplier: (
        key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
        value: number
    ) => void
    export let onSetBuzzerMode: (mode: "mouse-only" | "mouse-and-keyboard") => void
    export let onStartGame: (mode: "single" | "dual" | "keep-current") => void
</script>

{#if $setup}
    <PlayersPanel
        players={$setup.players}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
    />

    <BoardPreview board={$setup.board} />

    <GameOptionsPanel
        setup={$setup}
        presets={presets}
        onSelectRule={onSelectRule}
        onUpdateMultiplier={onUpdateMultiplier}
        onSetBuzzerMode={onSetBuzzerMode}
        onStartGame={onStartGame}
    />
{/if}
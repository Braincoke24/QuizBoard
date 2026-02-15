<script lang="ts">
    import type { PreGameSetup } from "./PreGameSetupState.js"
    import type { PreGameSetupAction } from "./PreGameSetupAction.js"
    import { WindowManager } from "../shared/WindowManager.js"
    import type { Role } from "../../app/AppView.svelte"

    import PlayersPanel from "./PlayersPanel.svelte"
    import BoardPreview from "./BoardPreview.svelte"
    import GameOptionsPanel from "./GameOptionsPanel.svelte"

    let {
        setup = $bindable(),
        dispatch,
        setRole,
    }: {
        setup: PreGameSetup | null
        dispatch: (action: PreGameSetupAction) => void
        setRole: (role: Role) => void
    } = $props()

    function onAddPlayer(name: string): void {
        dispatch({ type: "PRE_GAME_SETUP/ADD_PLAYER", name })
    }

    function onRemovePlayer(id: string): void {
        dispatch({ type: "PRE_GAME_SETUP/REMOVE_PLAYER", id })
    }

    function onSelectRule(ruleId: string): void {
        dispatch({ type: "PRE_GAME_SETUP/SELECT_RULE", ruleId })
    }

    function onUpdateMultiplier(
        key:
            | "firstWrongMultiplier"
            | "buzzCorrectMultiplier"
            | "buzzWrongMultiplier",
        value: number,
    ): void {
        dispatch({
            type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
            key,
            value,
        })
    }

    function onSetBuzzerMode(mode: "mouse-only" | "mouse-and-keyboard"): void {
        dispatch({ type: "PRE_GAME_SETUP/SET_BUZZER_MODE", mode })
    }

    function onStartGame(mode: "single" | "dual" | "keep-current"): void {
        if (mode === "single") setRole("player")

        if (mode === "dual") {
            setRole("game-master")
            WindowManager.openWindow("spectator")
        }

        dispatch({ type: "PRE_GAME_SETUP/START_GAME" })
    }
</script>

{#if setup}
    <div class="pre-game-setup">
        <PlayersPanel
            players={setup.players}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
        />

        <BoardPreview board={setup.board} />

        <GameOptionsPanel
            setup={setup}
            onSelectRule={onSelectRule}
            onUpdateMultiplier={onUpdateMultiplier}
            onSetBuzzerMode={onSetBuzzerMode}
            onStartGame={onStartGame}
        />
    </div>
{/if}

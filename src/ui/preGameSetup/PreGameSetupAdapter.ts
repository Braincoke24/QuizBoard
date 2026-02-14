// src/ui/preGameSetup/PreGameSetupAdapter.ts
import { mount, unmount } from "svelte"
import { writable, type Writable } from "svelte/store"
import PreGameSetupView from "./PreGameSetupView.svelte"
import { GAME_RULE_PRESETS } from "../../game/GameRulePresets.js"
import { WindowManager } from "../shared/WindowManager.js"
import type { PreGameSetup } from "./PreGameSetupState.js"
import type { PreGameSetupAction } from "./PreGameSetupAction.js"
import type { SnapshotUIAdapter } from "../shared/adapter/SnapshotUIAdapter.js"
import { AppSnapshot } from "../../app/AppSnapshot.js"

export class PreGameSetupAdapter implements SnapshotUIAdapter {
    private readonly setupStore: Writable<PreGameSetup | null>
    private component: ReturnType<typeof mount> | null = null
    public readonly isSnapshotAdapter = true

    constructor(
        dispatch: (action: PreGameSetupAction) => void,
        setRole: (role: "game-master" | "player" | "spectator") => void,
        root: HTMLElement
    ) {
        this.setupStore = writable(null)

        root.className = "app-content-root pre-game-setup"
        root.innerHTML = ""

        this.component = mount(PreGameSetupView, {
            target: root,
            props: {
                setup: this.setupStore,
                presets: GAME_RULE_PRESETS,

                onAddPlayer: (name: string): void =>
                    dispatch({ type: "PRE_GAME_SETUP/ADD_PLAYER", name }),

                onRemovePlayer: (id: string): void =>
                    dispatch({ type: "PRE_GAME_SETUP/REMOVE_PLAYER", id }),

                onSelectRule: (ruleId: string): void =>
                    dispatch({ type: "PRE_GAME_SETUP/SELECT_RULE", ruleId }),

                onUpdateMultiplier: (
                    key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
                    value: number
                ): void =>
                    dispatch({
                        type: "PRE_GAME_SETUP/UPDATE_CUSTOM_MULTIPLIER",
                        key,
                        value
                    }),

                onSetBuzzerMode: (mode: "mouse-only" | "mouse-and-keyboard"): void =>
                    dispatch({ type: "PRE_GAME_SETUP/SET_BUZZER_MODE", mode }),

                onStartGame: (mode: "single" | "dual" | "keep-current"): void => {
                    if (mode === "single") setRole("player")

                    if (mode === "dual") {
                        setRole("game-master")
                        WindowManager.openWindow("spectator")
                    }

                    dispatch({ type: "PRE_GAME_SETUP/START_GAME" })
                }
            }
        })
    }

    public update(snapshot: AppSnapshot): void {
        if (!snapshot.preGameSetup) return
        this.setupStore.set(snapshot.preGameSetup)
    }

    public destroy(): void {
        if (this.component) unmount(this.component)
    }
}

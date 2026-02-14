// src/ui/game/GameViewAdapter.ts
import { mount, unmount } from "svelte"
import { writable, type Writable, get } from "svelte/store"
import GameView from "./GameView.svelte"
import { GameAction } from "./GameAction.js"
import { GameUISnapshot } from "./state/GameUISnapshot.js"
import { UIViewProfile } from "../shared/view/UIViewProfile.js"
import { keyCodeNameMap } from "../buzzerConfig/BuzzerConfigAdapter.js"
import { AppSnapshot } from "../../app/AppSnapshot.js"
import { SnapshotUIAdapter } from "../shared/adapter/SnapshotUIAdapter.js"

/**
 * Connects the game UI renderer to the App via dispatch and snapshots.
 */
export class GameViewAdapter implements SnapshotUIAdapter {
    private readonly snapshotStore: Writable<GameUISnapshot | null>
    private component: ReturnType<typeof mount> | null = null
    public readonly isSnapshotAdapter = true
    private readonly keyHandler: (e: KeyboardEvent) => void

    constructor(
        dispatch: (action: GameAction) => void,
        profile: UIViewProfile,
        root: HTMLElement
    ) {
        this.snapshotStore = writable(null)

        root.className = "app-content-root game-running"
        root.innerHTML = ""

        this.component = mount(GameView, {
            target: root,
            props: {
                snapshot: this.snapshotStore,
                profile: profile,

                onSelectQuestion: (categoryIndex: number, questionIndex: number): void =>
                    dispatch({type: "GAME/SELECT_QUESTION", categoryIndex, questionIndex}),

                onBuzz: (playerId: string): void =>
                    dispatch({ type: "GAME/BUZZ", playerId }),

                onAnswer: (correct: boolean): void =>
                    dispatch({ type: "GAME/ANSWER", correct }),

                onPass: (): void =>
                    dispatch({ type: "GAME/PASS" }),

                onContinue: (): void =>
                    dispatch({type: "GAME/CONTINUE"})
            }
        })

        this.keyHandler = (e: KeyboardEvent): void => {
            if (
                e.metaKey ||
                e.altKey ||
                e.ctrlKey ||
                e.key.length !== 1
            ) {
                return
            }

            e.preventDefault()
            dispatch({
                type: "GAME/PRESS_KEY",
                key: keyCodeNameMap(e.code)
            })
        }

        window.addEventListener("keydown", this.keyHandler)
    }

    public update(snapshot: AppSnapshot): void {
        if (!snapshot.game) return
        this.snapshotStore.set(snapshot.game)
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.keyHandler)
        if (this.component) unmount(this.component)
    }
}

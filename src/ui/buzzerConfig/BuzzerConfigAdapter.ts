// src/ui/buzzerConfig/BuzzerConfigAdapter.ts
import { mount, unmount } from "svelte"
import { writable, type Writable, get } from "svelte/store"
import BuzzerConfigView from "./BuzzerConfigView.svelte"
import { BuzzerConfigSnapshot } from "./BuzzerConfigState.js"
import { BuzzerConfigAction } from "./BuzzerConfigAction.js"
import { AppSnapshot } from "../../app/AppSnapshot.js"
import { SnapshotUIAdapter } from "../shared/adapter/SnapshotUIAdapter.js"

export const keyCodeNameMap = (keyCode: string):string => {
    if (keyCode.startsWith("Digit")) return keyCode.slice(5)
    if (keyCode.startsWith("Numpad")) return "Num" + keyCode.slice(6)
    if (keyCode.startsWith("Key")) return keyCode.slice(3)

    return keyCode
}

export class BuzzerConfigAdapter implements SnapshotUIAdapter {
    private readonly snapshotStore: Writable<BuzzerConfigSnapshot | null>
    private component: ReturnType<typeof mount> | null = null
    public readonly isSnapshotAdapter = true
    private readonly keyHandler: (e: KeyboardEvent) => void

    constructor(
        dispatch: (action: BuzzerConfigAction) => void,
        root: HTMLElement
    ) {
        this.snapshotStore = writable(null)

        root.className = "app-content-root buzzer-config"
        root.innerHTML = ""

        this.component = mount(BuzzerConfigView, {
            target: root,
            props: {
                snapshot: this.snapshotStore,

                onSkip: (): void =>
                    dispatch({type: "BUZZER_CONFIG/SKIP_PLAYER"})
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
                type: "BUZZER_CONFIG/ASSIGN_KEY",
                key: keyCodeNameMap(e.code)
            })
        }

        window.addEventListener("keydown", this.keyHandler)
    }

    public update(snapshot: AppSnapshot): void {
        if (!snapshot.buzzerConfig) return
        this.snapshotStore.set(snapshot.buzzerConfig)
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.keyHandler)
        if (this.component) unmount(this.component)
    }
}

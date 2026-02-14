// src/ui/landing/renderers/WaitForSetupAdapter.ts
import { mount, unmount } from "svelte"
import { UIAdapter } from "../shared/adapter/UIAdapter.js"
import WaitForSetupView from "./WaitForSetupView.svelte"
import { PlayerUIState } from "../game/state/GameUIState.js"

/**
 * Connects the PreGameSetup renderer to the App via dispatch and snapshots.
 */
export class WaitForSetupAdapter implements UIAdapter {
    private component: ReturnType<typeof mount> | null = null

    constructor(
        root: HTMLElement,
        players?: readonly PlayerUIState[]
    ) {
        root.className = "app-content-root wait-for-setup"
        root.innerHTML = ""

        this.component = mount(WaitForSetupView, {
            target: root,
            props: {
                players: players
            }
        })
    }

    public destroy(): void {
        if (this.component) {
            unmount(this.component)
        }
    }
}

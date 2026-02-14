// src/ui/landing/LandingAdapter.ts
import { mount, unmount } from "svelte"
import LandingView from "./LandingView.svelte"
import type { LandingAction } from "./LandingAction.js"

/**
 * Connects the Landing view to the App via dispatch.
 */
export class LandingAdapter {
    private component: unknown

    constructor(
        dispatch: (action: LandingAction) => void,
        root: HTMLElement
    ) {
        root.className = "app-content-root landing"
        root.innerHTML = ""

        this.component = mount(LandingView, {
            target: root,
            props: {
                onStart: (): void => {
                    dispatch({
                        type: "LANDING/START"
                    })
                }
            }
        })
    }

    public destroy(): void {
        if (this.component) {
            unmount(this.component)
        }
    }
}

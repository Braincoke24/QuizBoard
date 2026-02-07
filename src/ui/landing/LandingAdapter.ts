// src/ui/landing/LandingAdapter.ts

import { LandingAction } from "./LandingAction.js"
import { LandingRenderer } from "./LandingRenderer.js"

/**
 * Connects the LandingRenderer to the App via dispatch and snapshots.
 */
export class LandingAdapter {
    private readonly renderer: LandingRenderer

    constructor(
        dispatch: (action: LandingAction) => void,
        root: HTMLElement
    ) {
        const start = (): void => {
            dispatch({
                type: "LANDING/START"
            })
        }
        
        this.renderer = new LandingRenderer(
            root,
            start
        )
    }

    public render(): void {
        this.renderer.render()
    }
}

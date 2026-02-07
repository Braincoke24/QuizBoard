// src/ui/landing/LandingController.ts

import { LandingAction } from "./LandingAction.js"
import { LandingCallbacks } from "./LandingCallbacks.js"

export class LandingController {
    constructor(
        private readonly callbacks: LandingCallbacks
    ) {}

    /* ---------- Public API ---------- */
    
    public dispatch(action: LandingAction): void {
        switch (action.type) {
            case "LANDING/START": {
                this.callbacks.onStart()
                return
            }
        }
    }
}

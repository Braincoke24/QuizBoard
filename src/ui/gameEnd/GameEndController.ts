// src/ui/gameEnd/GameEndController.ts
import { GameUISnapshot } from "../game/state/GameUISnapshot.js"
import { GameEndAction } from "./GameEndAction.js"
import { GameEndCallbacks } from "./GameEndCallbacks.js"

export class GameEndController {
    constructor(
        private readonly callbacks: GameEndCallbacks,
        public readonly snapshot: GameUISnapshot
    ) {}

    /* ---------- Public API ---------- */
    
    public dispatch(action: GameEndAction): void {
        switch (action.type) {
            case "GAME_ENDED/START_NEW_GAME": {
                return
            }
        }
    }
}

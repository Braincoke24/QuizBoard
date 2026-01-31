// src/ui/gameEnd/GameEndRenderer.ts

import { PlayerUIState } from "../game/state/GameUIState.js";

export class GameEndRenderer {
    constructor(
        private readonly root: HTMLElement
    ) {}

        public render(players: readonly PlayerUIState[]): void {
            this.root.innerHTML = ""
            
            this.root.className = "app-content-root game-ended"
        }
}

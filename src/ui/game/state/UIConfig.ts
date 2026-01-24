// src/ui/state/UIConfig.ts
import { ViewMode } from "./ViewMode.js"

export class UIConfig {
    private viewMode: ViewMode

    constructor(viewMode: ViewMode) {
        this.viewMode = viewMode
    }

    getViewMode(): ViewMode {
        return this.viewMode
    }

    setViewMode(viewMode: ViewMode): void {
        this.viewMode = viewMode
    }

    isGameMaster(): boolean {
        return this.viewMode === ViewMode.GAME_MASTER
    }
}

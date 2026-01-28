// src/app/shell/RoleSelectionAdapter.ts
import { RoleSelectionRenderer } from "./RoleSelectionRenderer.js"

export class RoleSelectionAdapter {
    private readonly renderer: RoleSelectionRenderer

    constructor(
        root: HTMLElement,
        onSelect: (role: "game-master" | "player" | "spectator") => void
    ) {
        this.renderer = new RoleSelectionRenderer(root, onSelect)
        this.renderer.render()
    }
}

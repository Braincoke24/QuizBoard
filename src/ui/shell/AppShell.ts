// src/ui/shell/AppShell.ts
import { RoleSelectionAdapter } from "./RoleSelectionAdapter.js"

export class AppShell {
    private readonly root: HTMLElement
    private readonly overlayRoot: HTMLElement
    private readonly contentRoot: HTMLElement

    private roleSelection: RoleSelectionAdapter | null = null

    constructor(root: HTMLElement) {
        this.root = root
        this.root.innerHTML = ""

        this.overlayRoot = document.createElement("div")
        this.overlayRoot.className = "app-overlay-root"

        this.contentRoot = document.createElement("div")
        this.contentRoot.className = "app-content-root"

        this.root.append(this.overlayRoot, this.contentRoot)
    }

    public getContentRoot(): HTMLElement {
        return this.contentRoot
    }

    public showRoleSelection(
        onSelect: (role: "game-master" | "player" | "spectator") => void
    ): void {
        this.overlayRoot.innerHTML = ""

        this.roleSelection = new RoleSelectionAdapter(
            this.overlayRoot,
            onSelect
        )
    }

    public clearOverlay(): void {
        this.overlayRoot.innerHTML = ""
        this.roleSelection = null
    }
}

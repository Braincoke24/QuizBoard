// src/ui/shell/AppShell.ts
import { RoleSelectionAdapter } from "./RoleSelectionAdapter.js"
import { TopBarAdapter } from "./TopBarAdapter.js"
import { UIViewProfile } from "../shared/view/UIViewProfile.js"

export class AppShell {
    private readonly root: HTMLElement
    private readonly overlayRoot: HTMLElement
    private readonly contentRoot: HTMLElement
    private readonly topBarRoot: HTMLElement

    private topBar: TopBarAdapter
    private roleSelection: RoleSelectionAdapter | null = null

    constructor(
        root: HTMLElement,
        onChangeRole: () => void
    ) {
        this.root = root
        this.root.innerHTML = ""

        this.topBarRoot = document.createElement("div")
        this.overlayRoot = document.createElement("div")
        this.contentRoot = document.createElement("div")

        this.topBarRoot.className = "app-top-bar-root"
        this.overlayRoot.className = "app-overlay-root"
        this.contentRoot.className = "app-content-root"

        this.root.append(
            this.topBarRoot,
            this.overlayRoot,
            this.contentRoot
        )

        this.topBar = new TopBarAdapter(
            this.topBarRoot,
            onChangeRole
        )
    }

    public getContentRoot(): HTMLElement {
        return this.contentRoot
    }

    public updateProfile(profile: UIViewProfile): void {
        this.topBar.updateProfile(profile)
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

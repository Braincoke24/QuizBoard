// src/ui/shell/RoleSelectionRenderer.ts
export class RoleSelectionRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly onSelect: (role: "game-master" | "player" | "spectator") => void
    ) {}

    public render(): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "role-selection"

        const title = document.createElement("div")
        title.className = "role-selection-title"
        title.textContent = "Choose your role"

        container.append(
            title,
            this.createButton("Gamemaster", "game-master"),
            this.createButton("Player", "player"),
            this.createButton("Spectator", "spectator")
        )

        this.root.appendChild(container)
    }

    private createButton(
        label: string,
        role: "game-master" | "player" | "spectator"
    ): HTMLButtonElement {
        const button = document.createElement("button")
        button.className = "role-selection-button action-button accent"
        button.textContent = label
        button.onclick = () => this.onSelect(role)
        return button
    }
}

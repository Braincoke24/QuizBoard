// src/ui/shell/TopBarRenderer.ts

export class TopBarRenderer {
    private readonly root: HTMLElement
    private readonly onChangeRole: () => void

    private roleLabel!: HTMLElement

    constructor(
        root: HTMLElement,
        onChangeRole: () => void
    ) {
        this.root = root
        this.onChangeRole = onChangeRole
    }

    public render(): void {
        this.root.innerHTML = ""
        this.root.className = "top-bar"

        this.roleLabel = document.createElement("span")
        this.roleLabel.className = "top-bar-role"

        const changeRoleButton = document.createElement("button")
        changeRoleButton.textContent = "Change Role"
        changeRoleButton.onclick = this.onChangeRole

        this.root.append(this.roleLabel, changeRoleButton)
    }

    public setRoleLabel(label: string): void {
        this.roleLabel.textContent = label
    }
}

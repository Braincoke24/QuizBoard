// src/ui/shell/TopBarRenderer.ts
import {
    LIGHT_MODE_SVG,
    DARK_MODE_SVG
} from "../shared/icons.js"
import { ThemeController } from "../shared/ThemeController.js"

export class TopBarRenderer {
    private roleLabel!: HTMLElement
    private themeButton!: HTMLButtonElement

    constructor(
        private readonly root: HTMLElement,
        private readonly onChangeRole: () => void,
        private readonly themeController: ThemeController
    ) {}

    public render(): void {
        this.root.innerHTML = ""
        this.root.className = "top-bar"

        this.roleLabel = document.createElement("span")
        this.roleLabel.className = "top-bar-role"

        const changeRoleButton = document.createElement("button")
        changeRoleButton.className = "top-bar-change-role"
        changeRoleButton.textContent = "Change Role"
        changeRoleButton.onclick = this.onChangeRole

        this.themeButton = document.createElement("button")
        this.themeButton.className = "top-bar-theme-toggle"
        this.themeButton.onclick = () => {
            const mode = this.themeController.toggle()
            this.updateThemeIcon(mode)
        }

        this.updateThemeIcon(this.themeController.getCurrent())

        this.root.append(
            this.roleLabel,
            changeRoleButton,
            this.themeButton
        )
    }

    private updateThemeIcon(mode: "light" | "dark"): void {
        this.themeButton.innerHTML =
            mode === "dark" ? DARK_MODE_SVG : LIGHT_MODE_SVG
    }

    public setRoleLabel(label: string): void {
        this.roleLabel.textContent = label
    }
}

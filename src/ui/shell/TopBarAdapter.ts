// src/ui/shell/TopBarAdapter.ts
import { UIViewProfile } from "../shared/view/UIViewProfile.js"
import { TopBarRenderer } from "./TopBarRenderer.js"
import { ThemeController } from "../shared/ThemeController.js"

export class TopBarAdapter {
    private readonly renderer: TopBarRenderer

    constructor(
        root: HTMLElement,
        onChangeRole: () => void,
        onReset: () => void,
        themeController: ThemeController,
    ) {
        this.renderer = new TopBarRenderer(
            root,
            onChangeRole,
            onReset,
            themeController,
        )

        this.renderer.render()
    }

    public updateProfile(profile: UIViewProfile): void {
        this.renderer.setRoleLabel(`${profile.displayName} view`)
    }
}

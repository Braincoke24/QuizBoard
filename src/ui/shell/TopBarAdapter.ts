// src/ui/shell/TopBarAdapter.ts
import { UIViewProfile } from "../shared/view/UIViewProfile.js"
import { TopBarRenderer } from "./TopBarRenderer.js"

export class TopBarAdapter {
    private readonly renderer: TopBarRenderer

    constructor(
        root: HTMLElement,
        onChangeRole: () => void
    ) {
        this.renderer = new TopBarRenderer(root, onChangeRole)
        this.renderer.render()
    }

    public updateProfile(profile: UIViewProfile): void {
        this.renderer.setRoleLabel(`${profile.displayName} View`)
    }
}

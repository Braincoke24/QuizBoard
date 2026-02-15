// src/ui/shared/WindowManager.ts

import type { RoleId } from "./view/UIViewProfile.js"

export class WindowManager {
    public static setCurrentRole(role: RoleId): void {
        const url = new URL(window.location.href)
        url.searchParams.set("role", role)
        window.history.pushState(null, "", url.toString())
    }

    public static openWindow(role: RoleId): void {
        const url = new URL(window.location.href)
        url.searchParams.set("role", role)

        const width = Math.floor(window.outerWidth * 0.7)
        const height = Math.floor(window.outerHeight * 0.7)

        const features = [
            "noopener",
            "noreferrer",
            `width=${width}`,
            `height=${height}`,
            "resizable=yes",
            "scrollbars=yes",
        ].join(",")

        window.open(url.toString(), "_blank", features)
    }
}

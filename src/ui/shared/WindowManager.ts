// src/ui/shared/WindowManager.ts

export class WindowManager {
    public static setCurrentRole(role: "player" | "game-master" | "spectator"): void {
        const url = new URL(window.location.href)
        url.searchParams.set("role", role)
        window.history.pushState(null, "", url.toString())
    }

    public static openWindow(role: "player" | "game-master" | "spectator"): void {
        const url = new URL(window.location.href)
        url.searchParams.set("role", role)
        window.open(url.toString(), "_blank", "noopener")
    }
}

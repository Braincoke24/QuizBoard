// src/ui/shared/ThemeController.ts

export type ThemeMode = "light" | "dark"

export class ThemeController {
    private readonly root: HTMLElement

    constructor(root: HTMLElement) {
        this.root = root
    }

    /**
     * Initialize theme based on URL param or system preference.
     */
    public init(): void {
        const themeFromUrl = this.getThemeFromUrl()

        if (themeFromUrl) {
            this.applyTheme(themeFromUrl)
            return
        }

        this.applySystemTheme()
    }

    /**
     * Toggle between light and dark and persist via URL.
     */
    public toggle(): ThemeMode {
        const next = this.root.classList.contains("dark") ? "light" : "dark"

        this.applyTheme(next)
        this.updateUrl(next)

        return next
    }

    /**
     * Get current active theme.
     */
    public getCurrent(): ThemeMode {
        return this.root.classList.contains("dark") ? "dark" : "light"
    }

    private applyTheme(theme: ThemeMode): void {
        this.root.classList.remove("dark", "light")
        this.root.classList.add(theme)
    }

    private applySystemTheme(): void {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches

        this.applyTheme(prefersDark ? "dark" : "light")
    }

    private getThemeFromUrl(): ThemeMode | null {
        const value = new URLSearchParams(window.location.search).get("theme")

        if (value === "dark" || value === "light") {
            return value
        }

        return null
    }

    private updateUrl(theme: ThemeMode): void {
        const url = new URL(window.location.href)
        url.searchParams.set("theme", theme)
        window.history.replaceState({}, "", url.toString())
    }
}

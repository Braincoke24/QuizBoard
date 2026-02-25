// src/ui/shared/ThemeController.ts

export type ThemeMode = "light" | "dark"

export const THEME_KEYS = ["mystery", "swamp", "tomato", "ocean"] as const
export type Theme = (typeof THEME_KEYS)[number]

/**
 * Type guard to validate theme strings.
 */
function isTheme(s: string): s is Theme {
    return THEME_KEYS.includes(s as Theme)
}

export class ThemeController {
    private readonly root: HTMLElement

    constructor(root: HTMLElement) {
        this.root = root
    }

    /**
     * Initialize theme based on URL param or system preference.
     */
    public init(): void {
        const themeModeFromUrl = this.getThemeModeFromUrl()
        const themeFromUrl = this.getThemeFromUrl()

        if (themeModeFromUrl) {
            this.applyThemeMode(themeModeFromUrl)
        } else {
            this.applySystemThemeMode()
        }

        if (themeFromUrl) {
            this.applyTheme(themeFromUrl)
        } else {
            this.applyTheme(THEME_KEYS[0])
        }
    }

    /**
     * Toggle between light and dark and persist via URL.
     */
    public toggleThemeMode(): ThemeMode {
        const next = this.root.classList.contains("dark") ? "light" : "dark"

        this.applyThemeMode(next)
        this.updateUrl("mode", next)

        return next
    }

    /**
     * Set theme and persist via URL.
     */
    public setTheme(theme: Theme): void {
        this.applyTheme(theme)
        this.updateUrl("theme", theme)
    }

    /**
     * Get current active theme mode.
     */
    public getCurrentThemeMode(): ThemeMode {
        return this.root.classList.contains("dark") ? "dark" : "light"
    }

    /**
     * Get current active theme.
     */
    public getCurrentTheme(): Theme {
        const themeClass = Array.from(this.root.classList).find((className) =>
            className.startsWith("theme-"),
        )

        if (themeClass) {
            const theme = themeClass.slice(6)

            if (isTheme(theme)) return theme
        }

        return THEME_KEYS[0]
    }

    private applyThemeMode(mode: ThemeMode): void {
        this.root.classList.remove("dark", "light")
        this.root.classList.add(mode)
    }

    private applyTheme(theme: Theme): void {
        THEME_KEYS.forEach((themeKey) => {
            this.root.classList.remove(`theme-${themeKey}`)
        })

        this.root.classList.add(`theme-${theme}`)
    }

    private applySystemThemeMode(): void {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches

        this.applyThemeMode(prefersDark ? "dark" : "light")
    }

    private getThemeModeFromUrl(): ThemeMode | null {
        const value = new URLSearchParams(window.location.search).get("mode")

        if (value === "dark" || value === "light") {
            return value
        }

        return null
    }

    private getThemeFromUrl(): Theme | null {
        const value = new URLSearchParams(window.location.search).get("theme")

        if (value && isTheme(value)) {
            return value as Theme
        }

        return null
    }

    private updateUrl(name: "mode" | "theme", value: ThemeMode | Theme): void {
        const url = new URL(window.location.href)
        url.searchParams.set(name, value)
        window.history.replaceState({}, "", url.toString())
    }
}

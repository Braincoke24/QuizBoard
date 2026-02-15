<script lang="ts">
    import { onMount } from "svelte"
    import type { ThemeController } from "../shared/ThemeController.js"

    import { LIGHT_MODE_SVG, DARK_MODE_SVG, HOME_SVG } from "../shared/icons.js"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"

    let {
        profile = $bindable(),
        themeController,
        onChangeRole,
        onReset,
    }: {
        profile: UIViewProfile
        themeController: ThemeController
        onChangeRole: () => void
        onReset: () => void
    } = $props()

    let themeIcon: string = $state(LIGHT_MODE_SVG)
    let themeTitle: string = $state("Switch to dark mode")

    function toggleTheme() {
        const mode = themeController.toggle()
        updateThemeIcon(mode)
    }

    function updateThemeIcon(mode: "light" | "dark") {
        themeIcon = mode === "dark" ? DARK_MODE_SVG : LIGHT_MODE_SVG
        themeTitle =
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
    }

    onMount(() => {
        updateThemeIcon(themeController.getCurrent())
    })
</script>

<span class="top-bar-role">{`${profile.displayName} view`}</span>
<button class="top-bar-change-role action-button" onclick={onChangeRole}
    >Change Role</button
>
<button class="top-bar-theme-toggle" onclick={toggleTheme} title={themeTitle}>
    {@html themeIcon}
</button>
<button class="top-bar-reset" title="Home" onclick={onReset}>
    {@html HOME_SVG}
</button>

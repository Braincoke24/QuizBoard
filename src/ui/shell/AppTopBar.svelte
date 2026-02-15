<script lang="ts">
    import { onMount } from "svelte"
    import { locale } from "svelte-i18n"
    import {
        setAppLocale,
        type AppLocale,
        LOCALES,
        SUPPORTED_LOCALES,
    } from "../../lib/i18n.js"

    import type { ThemeController } from "../shared/ThemeController.js"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import { clickOutside } from "../shared/attachments/clickOutside.js"

    import {
        LIGHT_MODE_SVG,
        DARK_MODE_SVG,
        HOME_SVG,
        LANG_SVG,
    } from "../shared/icons.js"

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

    let showLanguageMenu: boolean = $state(false)

    function toggleTheme(): void {
        const mode = themeController.toggle()
        updateThemeIcon(mode)
    }

    function updateThemeIcon(mode: "light" | "dark"): void {
        themeIcon = mode === "dark" ? DARK_MODE_SVG : LIGHT_MODE_SVG
        themeTitle =
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
    }

    function changeLanguage(lang: AppLocale): void {
        setAppLocale(lang)
        showLanguageMenu = false
    }

    onMount(() => {
        updateThemeIcon(themeController.getCurrent())
    })
</script>

<span class="top-bar-role">{`${profile.displayName} view`}</span>

<button class="top-bar-change-role action-button" onclick={onChangeRole}>
    Change Role
</button>

<!-- Language switcher -->
<div
    class="top-bar-language"
    {@attach clickOutside(() => (showLanguageMenu = false))}
>
    <button
        class="top-bar-language-toggle"
        title="Change language"
        onclick={() => (showLanguageMenu = !showLanguageMenu)}
    >
        {@html LANG_SVG}
    </button>

    {#if showLanguageMenu}
        <div class="top-bar-language-menu">
            {#each SUPPORTED_LOCALES as lang}
                <button
                    class:active={$locale === lang}
                    onclick={() => changeLanguage(lang)}
                >
                    {LOCALES[lang].label}
                </button>
            {/each}
        </div>
    {/if}
</div>

<button class="top-bar-theme-toggle" onclick={toggleTheme} title={themeTitle}>
    {@html themeIcon}
</button>

<button class="top-bar-reset" title="Home" onclick={onReset}>
    {@html HOME_SVG}
</button>

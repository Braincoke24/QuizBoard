<script lang="ts">
    import { onMount } from "svelte"
    import { _, locale } from "svelte-i18n"
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
        PALETTE_SVG,
    } from "../shared/icons.js"

    let {
        profile = $bindable(),
        themeController,
        themePickerActive = $bindable(),
        onChangeRole,
        onReset,
    }: {
        profile: UIViewProfile
        themeController: ThemeController
        themePickerActive: boolean
        onChangeRole: () => void
        onReset: () => void
    } = $props()

    let selectedThemeMode: string = $state("dark")

    let themeIcon: string = $derived(
        selectedThemeMode === "dark" ? DARK_MODE_SVG : LIGHT_MODE_SVG,
    )

    let themeModeSwitchTitle: string = $derived(
        selectedThemeMode === "dark"
            ? $_("app_top_bar.switch_light_mode")
            : $_("app_top_bar.switch_dark_mode"),
    )

    let showLanguageMenu: boolean = $state(false)

    function toggleThemeMode(): void {
        selectedThemeMode = themeController.toggleThemeMode()
    }

    function changeLanguage(lang: AppLocale): void {
        setAppLocale(lang)
        showLanguageMenu = false
    }

    onMount(() => {
        selectedThemeMode = themeController.getCurrentThemeMode()
    })
</script>

<span class="top-bar-role">
    {$_("app_top_bar.role_view_label", {
        values: {
            role: $_(`roles.${profile.id}`),
        },
    })}
</span>

<button class="top-bar-change-role action-button" onclick={onChangeRole}>
    {$_("app_top_bar.change_role")}
</button>

<div class="top-bar-symbols">
    <!-- Language switcher -->
    <div
        class="top-bar-language"
        {@attach clickOutside(() => (showLanguageMenu = false))}
    >
        <button
            class="top-bar-language-toggle"
            title={$_("app_top_bar.change_lang")}
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

    <button
        class="theme-mode-toggle"
        onclick={toggleThemeMode}
        title={themeModeSwitchTitle}
    >
        {@html themeIcon}
    </button>

    <button
        class="top-bar-theme-picker"
        title={$_("app_top_bar.theme_picker")}
        onclick={() => {
            themePickerActive = true
        }}
    >
        {@html PALETTE_SVG}
    </button>

    <button
        class="top-bar-reset"
        title={$_("app_top_bar.home")}
        onclick={onReset}
    >
        {@html HOME_SVG}
    </button>
</div>

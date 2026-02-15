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

    let mode: string = $state("dark")

    let themeIcon: string = $derived(
        mode === "dark" ? DARK_MODE_SVG : LIGHT_MODE_SVG,
    )

    let themeTitle: string = $derived(
        mode === "dark"
            ? $_("app_top_bar.switch_light_mode")
            : $_("app_top_bar.switch_dark_mode"),
    )

    let showLanguageMenu: boolean = $state(false)

    function toggleTheme(): void {
        mode = themeController.toggle()
    }

    function changeLanguage(lang: AppLocale): void {
        setAppLocale(lang)
        showLanguageMenu = false
    }

    onMount(() => {
        mode = themeController.getCurrent()
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

<button class="top-bar-theme-toggle" onclick={toggleTheme} title={themeTitle}>
    {@html themeIcon}
</button>

<button class="top-bar-reset" title="Home" onclick={onReset}>
    {@html HOME_SVG}
</button>

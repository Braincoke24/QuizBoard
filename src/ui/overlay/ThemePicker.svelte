<script lang="ts">
    import { _ } from "svelte-i18n"
    import { onMount } from "svelte"
    import { CLOSE_SVG } from "../shared/icons.js"
    import {
        THEME_KEYS,
        type ThemeController,
        type Theme,
    } from "../shared/ThemeController.js"

    let {
        themePickerActive = $bindable(),
        themeController,
    }: {
        themePickerActive: boolean
        themeController: ThemeController
    } = $props()

    let selectedTheme: Theme = $state("mystery")

    function closeModal(): void {
        themePickerActive = false
    }

    function selectTheme(theme: Theme): void {
        selectedTheme = theme

        themeController.setTheme(theme)
    }

    onMount(() => {
        selectedTheme = themeController.getCurrentTheme()
    })
</script>

{#if themePickerActive}
    <div class="theme-picker">
        <div class="theme-picker-title">{$_("theme_picker.title")}</div>

        {#each THEME_KEYS as themeKey}
            <button
                class="theme-container action-button"
                class:selected={selectedTheme === themeKey}
                onclick={() => selectTheme(themeKey)}
            >
                <div class="theme-name">
                    {$_(`theme_picker.themes.${themeKey}`)}
                </div>
                <div class={`theme-color-container theme-${themeKey}`}>
                    <div class="theme-color primary"></div>
                    <div class="theme-color accent"></div>
                    <div class="theme-color warning"></div>
                </div>
            </button>
        {/each}

        <button type="button" class="modal-close-button" onclick={closeModal}>
            {@html CLOSE_SVG}
        </button>
    </div>
{/if}

<script lang="ts">
    import type { ActiveOverlay } from "../../app/AppView.svelte"
    import type { RoleId } from "../shared/view/UIViewProfile.js"
    import RoleSelection from "../overlay/RoleSelection.svelte"
    import WarningMessage from "../overlay/WarningMessage.svelte"
    import { onMount } from "svelte"
    import ThemePicker from "../overlay/ThemePicker.svelte"
    import type { ThemeController } from "../shared/ThemeController.js"

    let {
        activeOverlay,
        roleSelectionActive = $bindable(),
        warningMessage = $bindable(),
        themePickerActive = $bindable(),
        themeController,
        applyRole,
    }: {
        activeOverlay: ActiveOverlay | null
        roleSelectionActive: boolean
        warningMessage: string | null
        themePickerActive: boolean
        themeController: ThemeController
        applyRole: (role: RoleId) => void
    } = $props()

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape" && activeOverlay) {
            roleSelectionActive = false
            themePickerActive = false
            warningMessage = null
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown)

        return () => {
            window.removeEventListener("keydown", handleKeydown)
        }
    })
</script>

{#if activeOverlay === "warning-message" && warningMessage}
    <WarningMessage bind:warningMessage={warningMessage} />
{:else if activeOverlay === "theme-picker"}
    <ThemePicker
        bind:themePickerActive={themePickerActive}
        themeController={themeController}
    />
{:else if activeOverlay === "role-selection"}
    <RoleSelection
        bind:roleSelectionActive={roleSelectionActive}
        applyRole={applyRole}
    />
{/if}

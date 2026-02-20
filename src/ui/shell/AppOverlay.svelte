<script lang="ts">
    import type { ActiveOverlay } from "../../app/AppView.svelte"
    import type { RoleId } from "../shared/view/UIViewProfile.js"
    import RoleSelection from "../overlay/RoleSelection.svelte"
    import WarningMessage from "../overlay/WarningMessage.svelte"

    let {
        activeOverlay,
        roleSelectionActive = $bindable(),
        warningMessage = $bindable(),
        applyRole,
    }: {
        activeOverlay: ActiveOverlay | null
        roleSelectionActive: boolean
        warningMessage: string | null
        applyRole: (role: RoleId) => void
    } = $props()
</script>

{#if activeOverlay === "role-selection"}
    <RoleSelection
        bind:roleSelectionActive={roleSelectionActive}
        applyRole={applyRole}
    />
{:else if activeOverlay === "warning-message" && warningMessage}
    <WarningMessage bind:warningMessage={warningMessage} />
{/if}

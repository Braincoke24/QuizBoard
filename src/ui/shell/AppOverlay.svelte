<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { ActiveOverlay } from "../../app/AppView.svelte"
    import { ROLE_IDS, type RoleId } from "../shared/view/UIViewProfile.js"

    let {
        activeOverlay = $bindable(),
        applyRole,
    }: {
        activeOverlay: ActiveOverlay | null
        applyRole: (role: RoleId) => void
    } = $props()
</script>

{#if activeOverlay === "role-selection"}
    <div class="role-selection">
        <div class="role-selection-title">Choose your role</div>
        {#each ROLE_IDS as id}
            <button
                class="role-selection-button action-button accent"
                onclick={() => {
                    applyRole(id as RoleId)
                    activeOverlay = null
                }}
            >
                {$_(`roles.${id}`)}
            </button>
        {/each}
    </div>
{/if}

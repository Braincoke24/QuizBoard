<script lang="ts">
    import { _ } from "svelte-i18n"
    import { ROLE_IDS, type RoleId } from "../shared/view/UIViewProfile.js"

    let {
        roleSelectionActive = $bindable(),
        applyRole,
    }: {
        roleSelectionActive: boolean
        applyRole: (role: RoleId) => void
    } = $props()
</script>

<div class="role-selection">
    <div class="role-selection-title">{$_("roles.choose")}</div>
    {#each ROLE_IDS as id}
        <button
            class="role-selection-button action-button accent"
            onclick={() => {
                applyRole(id as RoleId)
                roleSelectionActive = false
            }}
        >
            {$_(`roles.${id}`)}
        </button>
    {/each}
</div>

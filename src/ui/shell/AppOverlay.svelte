<script lang="ts">
    import type { ActiveOverlay } from "../../app/AppView.svelte"
    import type { Role } from "../../app/AppView.svelte"

    let {
        activeOverlay = $bindable(),
        applyRole,
    }: {
        activeOverlay: ActiveOverlay | null
        applyRole: (role: Role) => void
    } = $props()
</script>

{#if activeOverlay === "role-selection"}
    <div class="role-selection">
        <div class="role-selection-title">Choose your role</div>
        {#each [{ label: "Gamemaster", role: "game-master" }, { label: "Player", role: "player" }, { label: "Spectator", role: "spectator" }] as { label, role }}
            <button
                class="role-selection-button action-button accent"
                onclick={() => {
                    applyRole(role as Role)
                    activeOverlay = null
                }}
            >
                {label}
            </button>
        {/each}
    </div>
{/if}

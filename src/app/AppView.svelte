<script lang="ts">
    import { isLoading } from "svelte-i18n"
    import { onMount, onDestroy } from "svelte"

    import AppTopBar from "../ui/shell/AppTopBar.svelte"
    import AppContent from "../ui/shell/AppContent.svelte"
    import AppOverlay from "../ui/shell/AppOverlay.svelte"

    import type { AppAction } from "./AppAction.js"
    import type { AppSnapshot } from "./AppSnapshot.js"
    import type { AppPort } from "./ports/AppPort.js"
    import type { ThemeController } from "../ui/shared/ThemeController.js"
    import type { RoleId } from "../ui/shared/view/UIViewProfile.js"
    import { AppPhase } from "./AppPhase.js"
    import { RoleResolver } from "../shared/RoleResolver.js"
    import { WindowManager } from "../ui/shared/WindowManager.js"

    export type ActiveOverlay = "role-selection" | "warning-message"

    let {
        port,
        roleParam,
        themeController,
    }: { port: AppPort; roleParam: string; themeController: ThemeController } =
        $props()

    let warningMessage: string | null = $state(null)
    let roleSelectionActive = $state(false)

    let profile = $state(RoleResolver.resolve("player"))

    let activeOverlay: ActiveOverlay | null = $derived(getActiveOverlay())
    let overlayActive = $derived(activeOverlay !== null)

    let snapshot: AppSnapshot = $state({
        phase: AppPhase.LANDING,
        boardDraft: null,
        preGameSetup: null,
        buzzerConfig: null,
        game: null,
    })

    function getActiveOverlay(): ActiveOverlay | null {
        if (warningMessage) return "warning-message"
        if (roleSelectionActive) return "role-selection"

        return null
    }

    function applyRole(role: RoleId): void {
        profile = RoleResolver.resolve(role)
        WindowManager.setCurrentRole(role)
    }

    function listener(newSnapshot: AppSnapshot): void {
        snapshot = newSnapshot
    }

    onMount(() => {
        port.subscribe(listener)
        onDestroy(() => {
            port.unsubscribe(listener)
        })

        bootstrap(roleParam)
    })

    async function bootstrap(roleParam: string): Promise<void> {
        if (roleParam && RoleResolver.isValidRole(roleParam)) {
            applyRole(roleParam as RoleId)
            return
        }

        const isFirst = await port.isFirstClient()

        if (isFirst) {
            applyRole("player")
            return
        }

        showRoleSelection()
    }

    function dispatch(action: AppAction): void {
        try {
            port.dispatch(action)
        } catch (error) {
            warningMessage = (error as Error).message
        }
    }

    function showRoleSelection(): void {
        roleSelectionActive = true
    }
</script>

{#if !$isLoading}
    <div class="app-top-bar-root">
        <AppTopBar
            bind:profile={profile}
            themeController={themeController}
            onChangeRole={showRoleSelection}
            onReset={() => dispatch({ type: "APP/RESET" })}
        />
    </div>
    <div class="app-overlay-root" class:active={overlayActive}>
        <AppOverlay
            activeOverlay={activeOverlay}
            bind:roleSelectionActive={roleSelectionActive}
            bind:warningMessage={warningMessage}
            applyRole={applyRole}
        />
    </div>
    <div class="app-content-root" inert={overlayActive}>
        <AppContent
            bind:snapshot={snapshot}
            profile={profile}
            bind:warningMessage={warningMessage}
            dispatch={dispatch}
            applyRole={applyRole}
        />
    </div>
{/if}

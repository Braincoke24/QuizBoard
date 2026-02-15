<script lang="ts">
    import { onMount, onDestroy } from "svelte"

    import AppTopBar from "../ui/shell/AppTopBar.svelte"
    import AppContent from "../ui/shell/AppContent.svelte"
    import AppOverlay from "../ui/shell/AppOverlay.svelte"

    import type { AppAction } from "./AppAction.js"
    import type { AppSnapshot } from "./AppSnapshot.js"
    import type { AppPort } from "./ports/AppPort.js"
    import type { ThemeController } from "../ui/shared/ThemeController.js"
    import { AppPhase } from "./AppPhase.js"
    import { RoleResolver } from "../shared/RoleResolver.js"
    import { WindowManager } from "../ui/shared/WindowManager.js"

    export type ActiveOverlay = "role-selection"
    export type Role = "game-master" | "player" | "spectator"

    let {
        port,
        roleParam,
        themeController,
    }: { port: AppPort; roleParam: string; themeController: ThemeController } =
        $props()

    let profile = $state(RoleResolver.resolve("player"))
    let activeOverlay: ActiveOverlay | null = $state(null)
    let overlayActive = $derived(activeOverlay !== null)

    let snapshot: AppSnapshot = $state({
        phase: AppPhase.LANDING,
        boardDraft: null,
        preGameSetup: null,
        buzzerConfig: null,
        game: null,
    })

    function applyRole(role: Role): void {
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
            applyRole(roleParam as Role)
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
            alert((error as Error).message)
        }
    }

    function showRoleSelection(): void {
        activeOverlay = "role-selection"
    }
</script>

<div class="app-top-bar-root">
    <AppTopBar
        bind:profile={profile}
        themeController={themeController}
        onChangeRole={showRoleSelection}
        onReset={() => dispatch({ type: "APP/RESET" })}
    />
</div>
<div
    class="app-overlay-root
{overlayActive ? 'active' : ''}"
>
    <AppOverlay bind:activeOverlay={activeOverlay} applyRole={applyRole} />
</div>
<div class="app-content-root" inert={overlayActive}>
    <AppContent
        bind:snapshot={snapshot}
        profile={profile}
        dispatch={dispatch}
        applyRole={applyRole}
    />
</div>

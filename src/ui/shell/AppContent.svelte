<script lang="ts">
    import LandingView from "../landing/LandingView.svelte"
    import BoardDraftView from "../editBoard/BoardDraftView.svelte"
    import WaitForSetupView from "../editBoard/WaitForSetupView.svelte"
    import PreGameSetupView from "../preGameSetup/PreGameSetupView.svelte"
    import BuzzerConfigView from "../buzzerConfig/BuzzerConfigView.svelte"
    import GameView from "../game/GameView.svelte"
    import GameEndView from "../gameEnd/GameEndView.svelte"

    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { AppSnapshot } from "../../app/AppSnapshot.js"
    import type { AppAction } from "../../app/AppAction.js"
    import { AppPhase } from "../../app/AppPhase.js"
    import type { Role } from "../../app/AppView.svelte"

    let {
        snapshot = $bindable(),
        profile,
        dispatch,
        applyRole,
    }: {
        snapshot: AppSnapshot
        profile: UIViewProfile
        dispatch: (action: AppAction) => void
        applyRole: (role: Role) => void
    } = $props()
</script>

{#if snapshot.phase === AppPhase.LANDING}
    <LandingView
        dispatch={(action): void => {
            dispatch({
                type: "APP/LANDING",
                action: action,
            })
        }}
    />
{/if}
{#if snapshot.phase === AppPhase.EDIT_BOARD}
    {#if profile.visibility.showBoardEditor}
        <BoardDraftView
            bind:draft={snapshot.boardDraft}
            dispatch={(action): void => {
                dispatch({
                    type: "APP/BOARD_DRAFT",
                    action: action,
                })
            }}
        />
    {:else}
        <WaitForSetupView players={snapshot.game?.players} />
    {/if}
{/if}
{#if snapshot.phase === AppPhase.PRE_GAME_SETUP}
    <PreGameSetupView
        bind:setup={snapshot.preGameSetup}
        dispatch={(action): void => {
            dispatch({
                type: "APP/PRE_GAME_SETUP",
                action: action,
            })
        }}
        setRole={applyRole}
    />
{/if}
{#if snapshot.phase === AppPhase.BUZZER_CONFIG}
    <BuzzerConfigView
        bind:snapshot={snapshot.buzzerConfig}
        dispatch={(action): void => {
            dispatch({
                type: "APP/BUZZER_CONFIG",
                action: action,
            })
        }}
    />
{/if}
{#if snapshot.phase === AppPhase.GAME_RUNNING}
    <GameView
        bind:snapshot={snapshot.game}
        profile={profile}
        dispatch={(action): void => {
            dispatch({
                type: "APP/GAME",
                action: action,
            })
        }}
    />
{/if}
{#if snapshot.phase === AppPhase.GAME_ENDED}
    <GameEndView
        players={snapshot.game?.players}
        dispatch={(action): void => {
            dispatch({
                type: "APP/GAME_ENDED",
                action: action,
            })
        }}
    />
{/if}

<script lang="ts">
    import type { Writable } from "svelte/store"
    import type { UIViewProfile } from "../shared/view/UIViewProfile.js"
    import type { GameUISnapshot } from "./state/GameUISnapshot.js"

    import PlayersPanel from "./PlayersPanel.svelte"
    import Board from "./Board.svelte"

    export let snapshot: Writable<GameUISnapshot | null>
    export let profile: UIViewProfile

    export let onSelectQuestion: (c: number, r: number) => void
    export let onBuzz: (playerId: string) => void
    export let onAnswer: (isCorrect: boolean) => void
    export let onPass: () => void
    export let onContinue: () => void
</script>

{#if $snapshot}
    <PlayersPanel
        profile={profile}
        players={$snapshot.players}
        canBuzzIds={$snapshot.canBuzz}
        onBuzz={onBuzz}
    />

    <Board
        snapshot={$snapshot}
        profile={profile}
        onSelectQuestion={onSelectQuestion}
        onAnswer={onAnswer}
        onPass={onPass}
        onContinue={onContinue}
    />
{/if}

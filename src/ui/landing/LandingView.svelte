<script lang="ts">
    import version from "../../version.js"
    import type { LandingAction } from "./LandingAction.js"

    let { dispatch }: { dispatch: (action: LandingAction) => void } = $props()

    function onStart() {
        dispatch({ type: "LANDING/START" })
    }
</script>

<div class="landing">
    <div class="landing-title">QuizBoard</div>
    <div class="landing-version-label">{version}</div>

    <button class="action-button accent" onclick={onStart}> Start </button>
</div>

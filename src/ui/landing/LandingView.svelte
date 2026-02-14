<!-- src/ui/landing/LandingView.svelte -->
<script lang="ts">
    import version from "../../version.js"
    export let onStart: () => void
</script>

<div class="landing-title">QuizBoard</div>
<div class="landing-version-label">{version}</div>

<button class="action-button accent" on:click={onStart}> Start </button>

<!-- src/ui/landing/LandingView.svelte -->
<script lang="ts">
    /**
     * View-only callbacks.
     * No business logic allowed here.
     */
    export let onStart: () => void
</script>

<div class="landing-title">QuizBoard</div>
<div class="landing-version-label">1.0.0</div>

<button class="action-button accent" on:click={onStart}> Start </button>

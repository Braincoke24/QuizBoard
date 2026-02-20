<script lang="ts">
    import { _ } from "svelte-i18n"
    import { CLOSE_SVG } from "../shared/icons.js"

    let {
        warningMessage = $bindable(),
    }: {
        warningMessage: string | null
    } = $props()

    function closeModal(): void {
        warningMessage = null
    }
</script>

{#if warningMessage}
    <div class="warning-message">
        <div class="warning-message-title">{$_("warning_message.title")}:</div>
        <button type="button" class="modal-close-button" onclick={closeModal}>
            {@html CLOSE_SVG}
        </button>
        {warningMessage}
    </div>
{/if}

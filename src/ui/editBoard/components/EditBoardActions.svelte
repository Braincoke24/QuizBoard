<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { MediaPreview } from "../EditBoardView.svelte"

    let {
        mediaPreview,
        commit,
        onExportBoard,
        onSubmitBoard,
        handleBoardImport,
    }: {
        mediaPreview: MediaPreview | null
        commit: () => void
        onExportBoard: () => Promise<void>
        onSubmitBoard: () => void
        handleBoardImport: (event: Event) => Promise<void>
    } = $props()
</script>

<div class="edit-board-actions">
    <button
        class="draft-export-button action-button accent"
        disabled={mediaPreview !== null}
        onclick={onExportBoard}
    >
        {$_("board.export")}
    </button>

    <input
        class="draft-import-input"
        type="file"
        accept="application/json,application/zip"
        onchange={handleBoardImport}
    />

    <button
        class="draft-import-button action-button accent"
        disabled={mediaPreview !== null}
        onclick={() =>
            document
                .querySelector<HTMLInputElement>(".draft-import-input")
                ?.click()}
    >
        {$_("board.import")}
    </button>

    <button
        class="draft-submit-button action-button accent"
        disabled={mediaPreview !== null}
        onclick={() => {
            commit()
            onSubmitBoard()
        }}
    >
        {$_("board.submit")}
    </button>
</div>

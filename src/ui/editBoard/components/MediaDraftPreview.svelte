<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { MediaPreview } from "../EditBoardView.svelte"
    import { IMPORT_SVG, CLOSE_SVG } from "../../shared/icons.js"
    import MediaAsset from "../../shared/MediaAsset.svelte"

    let {
        mediaPreview = $bindable(),
        handleImageImport,
    }: {
        mediaPreview: MediaPreview | null
        handleImageImport: (
            event: Event,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => Promise<void>
    } = $props()

    function closeModal(): void {
        mediaPreview = null
    }
</script>

{#if mediaPreview}
    <div class="media-draft-preview">
        <MediaAsset id={mediaPreview.id} />

        <label class="action-button accent" title={$_("board.upload_media")}>
            {@html IMPORT_SVG}

            <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onchange={(event) => {
                    if (!mediaPreview) return
                    handleImageImport(
                        event,
                        mediaPreview.categoryIndex,
                        mediaPreview.rowIndex,
                        mediaPreview.kind,
                    )

                    closeModal()
                }}
            />
        </label>

        <button type="button" class="modal-close-button" onclick={closeModal}>
            {@html CLOSE_SVG}
        </button>
    </div>
{/if}

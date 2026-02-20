<script lang="ts">
    import { _ } from "svelte-i18n"
    import type { MediaPreview } from "../EditBoardView.svelte"
    import { EDIT_SVG, CLOSE_SVG, DELETE_SVG } from "../../shared/icons.js"
    import MediaAsset from "../../shared/media/MediaAsset.svelte"
    import { deleteMediaAsset } from "../../../media/mediaStore.js"
    import type { BoardDraft } from "../BoardDraftState.js"

    let {
        mediaPreview = $bindable(),
        draft = $bindable(),
        handleMediaImport,
    }: {
        mediaPreview: MediaPreview | null
        draft: BoardDraft
        handleMediaImport: (
            event: Event,
            categoryIndex: number,
            rowIndex: number,
            kind: "question" | "answer",
        ) => Promise<void>
    } = $props()

    function closeModal(): void {
        mediaPreview = null
    }

    async function deleteMedia(): Promise<void> {
        if (!mediaPreview) return
        if (mediaPreview.kind === "question") {
            draft.categories[mediaPreview.categoryIndex].questions[
                mediaPreview.rowIndex
            ].questionMedia = undefined
        } else {
            draft.categories[mediaPreview.categoryIndex].questions[
                mediaPreview.rowIndex
            ].answerMedia = undefined
        }
        await deleteMediaAsset(mediaPreview.id)
        closeModal()
    }
</script>

{#if mediaPreview}
    <div class="media-draft-preview">
        <MediaAsset id={mediaPreview.id} />

        <div class="media-draft-preview-actions">
            <label
                class="action-button accent"
                title={$_("board.change_media")}
            >
                {@html EDIT_SVG}

                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/ogg,audio/webm"
                    hidden
                    onchange={(event) => {
                        if (!mediaPreview) return
                        handleMediaImport(
                            event,
                            mediaPreview.categoryIndex,
                            mediaPreview.rowIndex,
                            mediaPreview.kind,
                        )

                        closeModal()
                    }}
                />
            </label>

            <button
                type="button"
                class="delete-media-button action-button warning"
                onclick={deleteMedia}
            >
                {@html DELETE_SVG}
            </button>
        </div>

        <button type="button" class="modal-close-button" onclick={closeModal}>
            {@html CLOSE_SVG}
        </button>
    </div>
{/if}

<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { getMediaAsset } from "../../../media/mediaStore.js"
    import AudioPlayer from "./AudioPlayer.svelte"

    let {
        id,
    }: {
        id: string
    } = $props()

    let url: string | null = $state(null)
    let mediaType: string = $state("")

    onMount(async () => {
        const asset = await getMediaAsset(id)
        if (!asset) return
        mediaType = asset.type
        url = URL.createObjectURL(asset.blob)
    })

    onDestroy(() => {
        if (url) URL.revokeObjectURL(url)
    })
</script>

{#if url}
    {#if mediaType === "image"}
        <img src={url} alt="" />
    {:else if mediaType === "audio"}
        <AudioPlayer src={url} />
    {/if}
{/if}

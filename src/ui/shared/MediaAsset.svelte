<script lang="ts">
    import { onMount, onDestroy } from "svelte"
    import { getMediaAsset } from "../../media/mediaStore.js"

    let {
        id,
    }: {
        id: string
    } = $props()

    let url: string | null = $state(null)

    onMount(async () => {
        const asset = await getMediaAsset(id)
        if (!asset) return
        url = URL.createObjectURL(asset.blob)
    })

    onDestroy(() => {
        if (url) URL.revokeObjectURL(url)
    })
</script>

{#if url}
    <img src={url} alt="" />
{/if}

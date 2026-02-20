<script lang="ts">
    import { PLAY_SVG, PAUSE_SVG } from "../icons.js"

    let { src }: { src: string } = $props()

    let time = $state(0)
    let duration = $state(0)
    let paused = $state(true)

    function format(time: number) {
        if (isNaN(time)) return "..."

        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)

        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
    }
</script>

<div class="audio-player" class:paused={paused}>
    <audio
        src={src}
        bind:currentTime={time}
        bind:duration={duration}
        bind:paused={paused}
        onended={() => {
            time = 0
        }}
    ></audio>

    <button class="action-button" onclick={() => (paused = !paused)}>
        {#if paused}
            {@html PLAY_SVG}
        {:else}
            {@html PAUSE_SVG}
        {/if}
    </button>

    <div class="time">
        <span>{format(time)}</span>
        <div
            class="slider"
            role="application"
            onpointerdown={(e) => {
                const div = e.currentTarget

                function seek(e: PointerEvent) {
                    const { left, width } = div.getBoundingClientRect()

                    let p = (e.clientX - left) / width
                    if (p < 0) p = 0
                    if (p > 1) p = 1

                    time = p * duration
                }

                seek(e)

                window.addEventListener("pointermove", seek)

                window.addEventListener(
                    "pointerup",
                    () => {
                        window.removeEventListener("pointermove", seek)
                    },
                    {
                        once: true,
                    },
                )
            }}
        >
            <div class="progress" style="--progress: {time / duration}%"></div>
        </div>
        <span>{duration ? format(duration) : "--:--"}</span>
    </div>
</div>

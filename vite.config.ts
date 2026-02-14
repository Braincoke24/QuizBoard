// vite.config.ts
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"

/**
 * Vite configuration for QuizBoard.
 */
export default defineConfig({
    plugins: [svelte()]
})

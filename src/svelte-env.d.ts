/// <reference types="svelte" />

import type { SvelteComponentTyped } from "svelte"

/**
 * Provide declarations for .svelte imports so the TS language
 * server and compiler understand them.
 */
declare module "*.svelte" {
    export default class SvelteComponent<
        Props = Record<string, any>,
        Events = Record<string, any>,
        Slots = Record<string, any>
    > extends SvelteComponentTyped<Props, Events, Slots> {}
}

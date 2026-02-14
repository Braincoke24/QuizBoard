// src/ui/shared/adapter/UIAdapter.ts

/**
 * Boundary between the App and a concrete UI implementation.
 *
 * Adapters own view lifecycle (mount/unmount) and translate
 * app-level actions into view callbacks.
 */
export interface UIAdapter {
    /**
     * Called when the adapter should release all resources
     * and detach its UI from the DOM.
     */
    destroy(): void
}
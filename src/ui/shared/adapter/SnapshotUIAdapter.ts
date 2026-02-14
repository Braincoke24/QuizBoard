// src/ui/shared/adapter/SnapshotUIAdapter.ts
import { AppSnapshot } from "../../../app/AppSnapshot.js"
import type { UIAdapter } from "./UIAdapter.js"

/**
 * UI adapter that is driven by application snapshots.
 */
export interface SnapshotUIAdapter extends UIAdapter {
    /**
     * Marker to identify snapshot-capable adapters at runtime.
     * Implementations must set this to `true`.
     */
    readonly isSnapshotAdapter: true

    /**
     * Called whenever a new snapshot is available.
     * Implementations must update their view accordingly.
     */
    update(snapshot: AppSnapshot): void
}

/**
 * Runtime type guard for SnapshotUIAdapter.
 */
export function isSnapshotUIAdapter(
    adapter: UIAdapter | null | undefined,
): adapter is SnapshotUIAdapter {
    return (
        typeof adapter === "object" &&
        adapter !== null &&
        (adapter as any).isSnapshotAdapter === true
    )
}

// src/app/ports/AppPort.ts
import { AppAction } from "../AppAction.js"
import { AppSnapshot } from "../AppSnapshot.js"

export interface AppPort {
    dispatch(action: AppAction): void

    subscribe(listener: (snapshot: AppSnapshot) => void): void
    unsubscribe(listener: (snapshot: AppSnapshot) => void): void

    /**
     * Returns true if this client is the first one connected to the app session.
     */
    isFirstClient(): Promise<boolean>
}

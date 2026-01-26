import { AppPort, AppSnapshot } from "./ports/AppPort.js"
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"

import { BoardDraftAdapter } from "../ui/editBoard/BoardDraftAdapter.js"
import { PreGameSetupAdapter } from "../ui/preGameSetup/PreGameSetupAdapter.js"
import { GameViewAdapter } from "../ui/game/GameViewAdapter.js"

import { RoleResolver } from "../shared/RoleResolver.js"
import { UIViewProfile } from "../ui/shared/view/UIViewProfile.js"

/**
 * UI composition root.
 * Wires AppPort to concrete UI adapters and DOM.
 */
export class App {
    private readonly port: AppPort
    private readonly root: HTMLElement
    private readonly profile: UIViewProfile

    private phase: AppPhase = AppPhase.EDIT_BOARD

    constructor(port: AppPort, roleParam: string, root: HTMLElement) {
        console.log("Started App")

        this.port = port
        this.root = root
        this.profile = RoleResolver.resolve(roleParam)

        this.port.subscribe(this.handleSnapshot.bind(this))
    }

    /* ---------- Snapshot Handling ---------- */

    private handleSnapshot(snapshot: AppSnapshot): void {
        if (snapshot.phase !== this.phase) {
            this.phase = snapshot.phase
            this.mountPhase(snapshot.phase)
        }

        this.update(snapshot)
    }

    /* ---------- Mounting ---------- */

    private mountPhase(phase: AppPhase): void {
        this.root.innerHTML = ""

        switch (phase) {
            case AppPhase.EDIT_BOARD:
                new BoardDraftAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/BOARD_DRAFT",
                            action
                        }),
                    this.root
                )
                break

            case AppPhase.PRE_GAME_SETUP:
                new PreGameSetupAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/PRE_GAME_SETUP",
                            action
                        }),
                    this.root
                )
                break

            case AppPhase.GAME_RUNNING:
                new GameViewAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/GAME",
                            action
                        }),
                    this.profile,
                    this.root
                )
                break

            default: {
                const exhaustive: never = phase
                throw new Error(`Unhandled AppPhase: ${exhaustive}`)
            }
        }
    }

    /* ---------- Updates ---------- */

    private update(snapshot: AppSnapshot): void {
        // Adapters pull what they need themselves.
        // GameViewAdapter is snapshot-driven internally.
        void snapshot
    }

    /* ---------- Dispatch ---------- */

    private dispatch(action: AppAction): void {
        try {
            this.port.dispatch(action)
        } catch (error) {
            alert((error as Error).message)
        }
    }
}

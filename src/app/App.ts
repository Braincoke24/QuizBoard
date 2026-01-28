// src/app/App.ts
import { AppPort, AppSnapshot } from "./ports/AppPort.js"
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"
import { AppShell } from "../ui/shell/AppShell.js"

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
    private readonly shell: AppShell
    private readonly root: HTMLElement

    private profile: UIViewProfile
    private subscribed = false

    private boardDraftAdapter: BoardDraftAdapter | null = null
    private preGameSetupAdapter: PreGameSetupAdapter | null = null
    private gameViewAdapter: GameViewAdapter | null = null

    private phase: AppPhase | null = null

    constructor(port: AppPort, roleParam: string, root: HTMLElement) {
        this.port = port
        this.root = root
        this.shell = new AppShell(root)

        this.profile = RoleResolver.resolve("player")
        this.bootstrap(roleParam)
    }

    /* ---------- Bootstrap ---------- */

    private async bootstrap(roleParam: string): Promise<void> {
        if (roleParam) {
            this.profile = RoleResolver.resolve(roleParam)
            this.subscribeOnce()
            return
        }

        const isFirst = await this.port.isFirstClient()

        if (isFirst) {
            this.profile = RoleResolver.resolve("player")
            this.subscribeOnce()
            return
        }

        this.shell.showRoleSelection((role) => {
            this.profile = RoleResolver.resolve(role)
            this.shell.clearOverlay()
            this.subscribeOnce()
        })
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
        const contentRoot = this.shell.getContentRoot()

        contentRoot.innerHTML = ""

        this.boardDraftAdapter = null
        this.preGameSetupAdapter = null
        this.gameViewAdapter = null

        switch (phase) {
            case AppPhase.EDIT_BOARD:
                this.boardDraftAdapter = new BoardDraftAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/BOARD_DRAFT",
                            action
                        }),
                    contentRoot
                )
                break

            case AppPhase.PRE_GAME_SETUP:
                this.preGameSetupAdapter = new PreGameSetupAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/PRE_GAME_SETUP",
                            action
                        }),
                    contentRoot
                )
                break

            case AppPhase.GAME_RUNNING:
                this.gameViewAdapter = new GameViewAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/GAME",
                            action
                        }),
                    this.profile,
                    contentRoot
                )
                break
        }
    }

    /* ---------- Updates ---------- */

    private update(snapshot: AppSnapshot): void {
        switch (this.phase) {
            case AppPhase.EDIT_BOARD:
                if (this.boardDraftAdapter && snapshot.boardDraft) {
                    this.boardDraftAdapter.render(snapshot.boardDraft)
                }
                break

            case AppPhase.PRE_GAME_SETUP:
                if (this.preGameSetupAdapter && snapshot.preGameSetup) {
                    this.preGameSetupAdapter.render(snapshot.preGameSetup)
                }
                break

            case AppPhase.GAME_RUNNING:
                if (this.gameViewAdapter && snapshot.game) {
                    this.gameViewAdapter.render(snapshot.game)
                }
                break
        }
    }

    /* ---------- Subscribe ---------- */
    private subscribeOnce(): void {
        if (this.subscribed) return
        this.subscribed = true
        this.port.subscribe(this.handleSnapshot.bind(this))
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

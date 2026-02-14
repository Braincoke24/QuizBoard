// src/app/App.ts
import { AppPort } from "./ports/AppPort.js"
import { AppSnapshot } from "./AppSnapshot.js"
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"
import { AppShell } from "../ui/shell/AppShell.js"
import { WindowManager } from "../ui/shared/WindowManager.js"
import { ThemeController } from "../ui/shared/ThemeController.js"

import { LandingAdapter } from "../ui/landing/LandingAdapter.js"
import { BoardDraftAdapter } from "../ui/editBoard/BoardDraftAdapter.js"
import { PreGameSetupAdapter } from "../ui/preGameSetup/PreGameSetupAdapter.js"
import { GameViewAdapter } from "../ui/game/GameViewAdapter.js"
import { GameEndAdapter } from "../ui/gameEnd/GameEndAdapter.js"
import { WaitForSetupAdapter } from "../ui/editBoard/WaitForSetupAdapter.js"
import { BuzzerConfigAdapter } from "../ui/buzzerConfig/BuzzerConfigAdapter.js"

import { RoleResolver } from "../shared/RoleResolver.js"
import { UIViewProfile } from "../ui/shared/view/UIViewProfile.js"
import { UIAdapter } from "../ui/shared/adapter/UIAdapter.js"
import { isSnapshotUIAdapter } from "../ui/shared/adapter/SnapshotUIAdapter.js"

/**
 * UI composition root.
 * Wires AppPort to concrete UI adapters and DOM.
 */
export class App {
    private readonly port: AppPort
    private readonly shell: AppShell

    private profile: UIViewProfile
    private lastSnapshot: AppSnapshot | null = null
    private subscribed = false

    private adapter: UIAdapter | null = null

    private landingAdapter: LandingAdapter | null = null
    private boardDraftAdapter: BoardDraftAdapter | null = null
    private preGameSetupAdapter: PreGameSetupAdapter | null = null
    private buzzerConfigAdapter: BuzzerConfigAdapter | null = null
    private gameViewAdapter: GameViewAdapter | null = null
    private gameEndAdapter: GameEndAdapter | null = null
    private waitForSetupAdapter: WaitForSetupAdapter | null = null

    private phase: AppPhase | null = null

    constructor(
        port: AppPort,
        roleParam: string,
        root: HTMLElement,
        themeController: ThemeController,
    ) {
        this.port = port
        this.shell = new AppShell(
            root,
            () => this.requestRoleChange(),
            () => this.requestReset(),
            themeController,
        )

        this.profile = RoleResolver.resolve("player")
        this.bootstrap(roleParam)
    }

    /* ---------- Bootstrap ---------- */

    private async bootstrap(roleParam: string): Promise<void> {
        if (roleParam && RoleResolver.isValidRole(roleParam)) {
            this.applyRole(roleParam as "game-master" | "player" | "spectator")
            return
        }

        const isFirst = await this.port.isFirstClient()

        if (isFirst) {
            this.applyRole("player")
            return
        }

        this.requestRoleChange()
    }

    private requestRoleChange(): void {
        this.shell.showRoleSelection((role) => {
            this.applyRole(role)
            this.shell.clearOverlay()
        })
    }

    private requestReset(): void {
        this.dispatch({
            type: "APP/RESET",
        })
    }

    private applyRole(role: "game-master" | "player" | "spectator"): void {
        this.profile = RoleResolver.resolve(role)
        this.shell.updateProfile(this.profile)

        WindowManager.setCurrentRole(role)

        this.subscribeOnce()

        if (this.phase !== null && this.lastSnapshot !== null) {
            this.remountAndRender()
        }
    }

    /* ---------- Snapshot Handling ---------- */

    private handleSnapshot(snapshot: AppSnapshot): void {
        this.lastSnapshot = snapshot

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

        this.adapter?.destroy()

        this.adapter = null
        this.landingAdapter = null
        this.boardDraftAdapter = null
        this.preGameSetupAdapter = null
        this.buzzerConfigAdapter = null
        this.gameViewAdapter = null
        this.gameEndAdapter = null
        this.waitForSetupAdapter = null

        switch (phase) {
            case AppPhase.LANDING:
                this.landingAdapter = new LandingAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/LANDING",
                            action,
                        }),
                    contentRoot,
                )
                this.adapter = this.landingAdapter
                break

            case AppPhase.EDIT_BOARD:
                if (this.profile.visibility.showBoardEditor) {
                    this.boardDraftAdapter = new BoardDraftAdapter(
                        (action) =>
                            this.dispatch({
                                type: "APP/BOARD_DRAFT",
                                action,
                            }),
                        contentRoot,
                    )
                    this.adapter = this.boardDraftAdapter
                } else {
                    const players = this.lastSnapshot?.game?.players
                    this.waitForSetupAdapter = new WaitForSetupAdapter(
                        contentRoot,
                        players,
                    )
                    this.adapter = this.waitForSetupAdapter
                }
                break

            case AppPhase.PRE_GAME_SETUP:
                this.preGameSetupAdapter = new PreGameSetupAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/PRE_GAME_SETUP",
                            action,
                        }),
                    (role) => this.applyRole(role),
                    contentRoot,
                )
                this.adapter = this.preGameSetupAdapter
                break

            case AppPhase.BUZZER_CONFIG:
                this.buzzerConfigAdapter = new BuzzerConfigAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/BUZZER_CONFIG",
                            action,
                        }),
                    contentRoot,
                )
                this.adapter = this.buzzerConfigAdapter
                break

            case AppPhase.GAME_RUNNING:
                this.gameViewAdapter = new GameViewAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/GAME",
                            action,
                        }),
                    this.profile,
                    contentRoot,
                )
                this.adapter = this.gameViewAdapter
                break

            case AppPhase.GAME_ENDED:
                const players = this.lastSnapshot?.game?.players
                if (!players) return

                this.gameEndAdapter = new GameEndAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/GAME_ENDED",
                            action,
                        }),
                    contentRoot,
                    players,
                )
                this.adapter = this.gameEndAdapter
                break
        }
    }

    private remountAndRender(): void {
        if (!this.phase || !this.lastSnapshot) return
        this.mountPhase(this.phase)
        this.update(this.lastSnapshot)
    }

    /* ---------- Updates ---------- */

    private update(snapshot: AppSnapshot): void {
        if (this.adapter && isSnapshotUIAdapter(this.adapter)) {
            this.adapter.update(snapshot)
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

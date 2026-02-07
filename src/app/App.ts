// src/app/App.ts
import { AppPort } from "./ports/AppPort.js"
import { AppSnapshot } from "./AppSnapshot.js"
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"
import { AppShell } from "../ui/shell/AppShell.js"
import { WindowManager } from "../ui/shared/WindowManager.js"
import { ThemeController } from "../ui/shared/ThemeController.js"

import { BoardDraftAdapter } from "../ui/editBoard/BoardDraftAdapter.js"
import { PreGameSetupAdapter } from "../ui/preGameSetup/PreGameSetupAdapter.js"
import { GameViewAdapter } from "../ui/game/GameViewAdapter.js"
import { GameEndAdapter } from "../ui/gameEnd/GameEndAdapter.js"
import { WaitForSetupAdapter } from "../ui/editBoard/WaitForSetupAdapter.js"
import { BuzzerConfigAdapter } from "../ui/buzzerConfig/BuzzerConfigAdapter.js"

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
    private lastSnapshot: AppSnapshot | null = null
    private subscribed = false

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
        themeController: ThemeController
    ) {
        this.port = port
        this.root = root
        this.shell = new AppShell(
            root,
            () => this.requestRoleChange(),
            themeController
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

        this.buzzerConfigAdapter?.destroy()
        this.gameViewAdapter?.destroy()

        this.boardDraftAdapter = null
        this.preGameSetupAdapter = null
        this.buzzerConfigAdapter = null
        this.gameViewAdapter = null
        this.gameEndAdapter = null
        this.waitForSetupAdapter = null

        switch (phase) {
            case AppPhase.EDIT_BOARD:
                if (this.profile.visibility.showBoardEditor) {
                    this.boardDraftAdapter = new BoardDraftAdapter(
                        (action) =>
                            this.dispatch({
                                type: "APP/BOARD_DRAFT",
                                action
                            }),
                        contentRoot
                    )
                } else {
                    this.waitForSetupAdapter = new WaitForSetupAdapter(contentRoot)
                }
                break

            case AppPhase.PRE_GAME_SETUP:
                this.preGameSetupAdapter = new PreGameSetupAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/PRE_GAME_SETUP",
                            action
                        }),
                    (role) => this.applyRole(role),
                    contentRoot
                )
                break

            case AppPhase.BUZZER_CONFIG:
                this.buzzerConfigAdapter = new BuzzerConfigAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/BUZZER_CONFIG",
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

            case AppPhase.GAME_ENDED:
                this.gameEndAdapter = new GameEndAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/GAME_ENDED",
                            action
                        }),
                    contentRoot
                )
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
        switch (this.phase) {
            case AppPhase.EDIT_BOARD:
                if (this.boardDraftAdapter && snapshot.boardDraft && this.profile.visibility.showBoardEditor) {
                    this.boardDraftAdapter.render(snapshot.boardDraft)
                } else if (this.waitForSetupAdapter && !this.profile.visibility.showBoardEditor) {
                    const players = snapshot.game?.players
                    this.waitForSetupAdapter.render(players)
                }
                break

            case AppPhase.PRE_GAME_SETUP:
                if (this.preGameSetupAdapter && snapshot.preGameSetup) {
                    this.preGameSetupAdapter.render(snapshot.preGameSetup)
                }
                break

            case AppPhase.BUZZER_CONFIG:
                if (this.buzzerConfigAdapter && snapshot.buzzerConfig) {
                    this.buzzerConfigAdapter.render(snapshot.buzzerConfig)
                }
                break

            case AppPhase.GAME_RUNNING:
                if (this.gameViewAdapter && snapshot.game) {
                    this.gameViewAdapter.render(snapshot.game)
                }
                break

            case AppPhase.GAME_ENDED:
                if (this.gameEndAdapter && snapshot.game?.players) {
                    this.gameEndAdapter.render(snapshot.game.players)
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

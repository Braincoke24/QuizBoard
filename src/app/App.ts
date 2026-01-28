// src/app/App.ts
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
    private profile: UIViewProfile

    private boardDraftAdapter: BoardDraftAdapter | null = null
    private preGameSetupAdapter: PreGameSetupAdapter | null = null
    private gameViewAdapter: GameViewAdapter | null = null

    private phase: AppPhase | null = null

    private subscribed = false

    constructor(port: AppPort, roleParam: string, root: HTMLElement) {
        console.log("Started App")

        this.port = port
        this.root = root

        this.profile = RoleResolver.resolve("player") // temporary default
        this.bootstrap(roleParam)
    }

    /* ---------- Bootstrap ---------- */

    private async bootstrap(roleParam: string): Promise<void> {
        // 1. Role explicitly provided via URL
        if (roleParam) {
            this.profile = RoleResolver.resolve(roleParam)
            this.subscribeOnce()
            return
        }

        // 2. SharedWorker-aware role decision
        const isFirst = await this.port.isFirstClient()

        if (isFirst) {
            // First window: implicit Player/GameMaster hybrid
            this.profile = RoleResolver.resolve("player")
            this.subscribeOnce()
            return
        }

        // Not first client → show role selection (later)
        this.showRoleSelection()
        return
    }

    private showRoleSelection(): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "role-selection"

        const title = document.createElement("h2")
        title.textContent = "Choose your role"

        const gameMasterButton = document.createElement("button")
        gameMasterButton.textContent = "Gamemaster"
        gameMasterButton.onclick = () => {
            this.profile = RoleResolver.resolve("game-master")
            this.subscribeOnce()
        }

        const playerButton = document.createElement("button")
        playerButton.textContent = "Player"
        playerButton.onclick = () => {
            this.profile = RoleResolver.resolve("player")
            this.subscribeOnce()
        }

        const spectatorButton = document.createElement("button")
        spectatorButton.textContent = "Spectator"
        spectatorButton.onclick = () => {
            this.profile = RoleResolver.resolve("spectator")
            this.subscribeOnce()
        }

        container.append(title, gameMasterButton, playerButton, spectatorButton)
        this.root.appendChild(container)
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
                    this.root
                )
                break

            case AppPhase.PRE_GAME_SETUP:
                this.preGameSetupAdapter = new PreGameSetupAdapter(
                    (action) =>
                        this.dispatch({
                            type: "APP/PRE_GAME_SETUP",
                            action
                        }),
                    this.root
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
                    this.root
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

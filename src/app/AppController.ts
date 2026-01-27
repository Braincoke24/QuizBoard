// src/app/AppController.ts
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"

import { BoardDraftController } from "../ui/editBoard/BoardDraftController.js"
import { PreGameSetupController } from "../ui/preGameSetup/PreGameSetupController.js"
import { GameController } from "../ui/game/GameController.js"

import { GameRules } from "../game/GameRules.js"
import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"

import { boardDraftToBoard } from "../shared/BoardMapper.js"

export class AppController {
    private phase: AppPhase = AppPhase.EDIT_BOARD

    private boardDraftController = new BoardDraftController()
    private preGameSetupController: PreGameSetupController | null = null
    private gameController: GameController | null = null

    /* ---------- Public API ---------- */

    public getPhase(): AppPhase {
        return this.phase
    }

    public dispatch(action: AppAction): void {
        switch (action.type) {
            case "APP/BOARD_DRAFT":
                this.assertPhase(AppPhase.EDIT_BOARD)
                this.boardDraftController.dispatch(action.action)
                return

            case "APP/START_PRE_GAME_SETUP":
                this.startPreGameSetup()
                return

            case "APP/PRE_GAME_SETUP":
                this.assertPhase(AppPhase.PRE_GAME_SETUP)
                this.preGameSetupController!.dispatch(action.action)
                return

            case "APP/START_GAME":
                this.startGame()
                return

            case "APP/GAME":
                this.assertPhase(AppPhase.GAME_RUNNING)
                this.gameController!.dispatch(action.action)
                return

            case "APP/RESET":
                this.reset()
                return

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled AppAction: ${exhaustive}`)
            }
        }
    }

    /* ---------- Phase Transitions ---------- */

    private startPreGameSetup(): void {
        this.assertPhase(AppPhase.EDIT_BOARD)

        const board = this.boardDraftController.getSnapshot()

        if (!board) {
            throw new Error("Failed to export board")
        }

        this.preGameSetupController = new PreGameSetupController(board)
        this.phase = AppPhase.PRE_GAME_SETUP
    }

    private startGame(): void {
        this.assertPhase(AppPhase.PRE_GAME_SETUP)

        const setup = this.preGameSetupController!.getSnapshot()
        const boardDraft = this.preGameSetupController!.getBoardDraft()
        const gamePlayers = setup.players.map(
            (config) => new Player(config.id, config.name)
        )
        const board = boardDraftToBoard(boardDraft)

        const game = new Game(gamePlayers, board, GameRules.classic())
        this.gameController = new GameController(game)

        this.phase = AppPhase.GAME_RUNNING
    }

    private reset(): void {
        this.phase = AppPhase.EDIT_BOARD
        this.boardDraftController = new BoardDraftController()
        this.preGameSetupController = null
        this.gameController = null
    }

    /* ---------- Snapshots ---------- */

    public getBoardDraftSnapshot() {
        return this.boardDraftController.getSnapshot()
    }

    public getPreGameSetupSnapshot() {
        return this.preGameSetupController?.getSnapshot() ?? null
    }

    public getGameSnapshot() {
        return this.gameController?.getSnapshot() ?? null
    }

    /* ---------- Helpers ---------- */

    private assertPhase(expected: AppPhase): void {
        if (this.phase !== expected) {
            throw new Error(
                `Invalid action for phase ${this.phase}, expected ${expected}`
            )
        }
    }
}

// src/app/AppController.ts
import { AppPhase } from "./AppPhase.js"
import { AppAction } from "./AppAction.js"

import { LandingController } from "../ui/landing/LandingController.js"
import { BoardDraftController } from "../ui/editBoard/BoardDraftController.js"
import { PreGameSetupController } from "../ui/preGameSetup/PreGameSetupController.js"
import { GameController } from "../ui/game/GameController.js"
import { GameEndController } from "../ui/gameEnd/GameEndController.js"
import { BuzzerConfigController } from "../ui/buzzerConfig/BuzzerConfigController.js"

import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"

import { boardDraftToBoard } from "../shared/BoardMapper.js"
import { BoardDraft } from "../ui/editBoard/BoardDraftState.js"
import { PreGameSetupCallbacks } from "../ui/preGameSetup/PreGameSetupCallbacks.js"
import { BoardDraftCallbacks } from "../ui/editBoard/BoardDraftCallbacks.js"
import { GameUISnapshot } from "../ui/game/state/GameUISnapshot.js"
import { GameEndCallbacks } from "../ui/gameEnd/GameEndCallbacks.js"
import { GameCallbacks } from "../ui/game/GameCallbacks.js"
import { PlayerConfig } from "../ui/preGameSetup/PreGameSetupState.js"
import { LandingCallbacks } from "../ui/landing/LandingCallbacks.js"

export class AppController {
    private phase: AppPhase = AppPhase.LANDING
    
    private landingController: LandingController
    private boardDraftController: BoardDraftController | null = null
    private preGameSetupController: PreGameSetupController | null = null
    private buzzerConfigController: BuzzerConfigController | null = null
    private gameController: GameController | null = null
    private gameEndController: GameEndController | null = null

    private buzzerKeys: Record<string, string> | null = null

    constructor() {
        this.landingController = this.createLandingController()
    }

    /* ---------- Public API ---------- */

    public getPhase(): AppPhase {
        return this.phase
    }

    public dispatch(action: AppAction): void {
        switch (action.type) {
            case "APP/LANDING":
                this.assertPhase([AppPhase.LANDING])
                this.landingController!.dispatch(action.action)
                return

            case "APP/BOARD_DRAFT":
                this.assertPhase([AppPhase.EDIT_BOARD])
                this.boardDraftController!.dispatch(action.action)
                return

            case "APP/PRE_GAME_SETUP":
                this.assertPhase([AppPhase.PRE_GAME_SETUP])
                this.preGameSetupController!.dispatch(action.action)
                return

            case "APP/BUZZER_CONFIG":
                this.assertPhase([AppPhase.BUZZER_CONFIG])
                this.buzzerConfigController!.dispatch(action.action)
                return

            case "APP/GAME":
                this.assertPhase([AppPhase.GAME_RUNNING])
                this.gameController!.dispatch(action.action)
                return

            case "APP/GAME_ENDED":
                this.assertPhase([AppPhase.GAME_ENDED])
                this.gameEndController!.dispatch(action.action)
                return

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled AppAction: ${exhaustive}`)
            }
        }
    }

    /* ---------- Transitions ---------- */

    private startBoardDraftEditor(): void {
        this.assertPhase([AppPhase.LANDING, AppPhase.GAME_ENDED])
        
        this.boardDraftController = this.createBoardDraftController()

        this.phase = AppPhase.EDIT_BOARD
    }

    private startPreGameSetup(): void {
        this.assertPhase([AppPhase.EDIT_BOARD])

        const boardDraft = this.boardDraftController!.getSnapshot()

        this.preGameSetupController = this.createPreGameSetupController(boardDraft)
        this.phase = AppPhase.PRE_GAME_SETUP
    }

    private startGame(): void {
        this.assertPhase([AppPhase.PRE_GAME_SETUP, AppPhase.BUZZER_CONFIG])

        const setup = this.preGameSetupController!.getSnapshot()
        const boardDraft = this.preGameSetupController!.getBoardDraft()

        const players = setup.players.map(
            (config) => new Player(config.id, config.name)
        )

        const board = boardDraftToBoard(boardDraft)
        const rules = this.preGameSetupController!.getGameRules()
        const game = new Game(players, board, rules)

        this.gameController = this.createGameController(game)
        this.phase = AppPhase.GAME_RUNNING
    }

    private startGameFlow(): void {
        this.assertPhase([AppPhase.PRE_GAME_SETUP])

        const setup = this.preGameSetupController!.getSnapshot()

        if (setup.buzzerMode === "mouse-and-keyboard" && setup.players.length > 1) {
            this.startBuzzerConfig(setup.players)
            return
        }

        this.startGame()
    }

    private startBuzzerConfig(players: PlayerConfig[]): void {
        this.buzzerKeys = null

        this.buzzerConfigController = new BuzzerConfigController(players, {
            onDone: (keys) => {
                this.buzzerKeys = keys
                this.startGame()
            }
        })

        this.phase = AppPhase.BUZZER_CONFIG
    }

    private endGame(): void {
        this.assertPhase([AppPhase.GAME_RUNNING])

        const snapshot = this.gameController!.getSnapshot()

        this.gameEndController = this.createGameEndController(snapshot)

        this.phase = AppPhase.GAME_ENDED
    }

    /* ---------- Snapshots ---------- */

    public getBoardDraftSnapshot() {
        return this.boardDraftController?.getSnapshot() ?? null
    }

    public getPreGameSetupSnapshot() {
        return this.preGameSetupController?.getSnapshot() ?? null
    }

    public getBuzzerConfigSnapshot() {
        return this.buzzerConfigController?.getSnapshot() ?? null
    }

    public getGameSnapshot() {
        return this.gameController?.getSnapshot() ?? null
    }

    /* ---------- Factory ---------- */

    private createLandingController(): LandingController {
        const callbacks: LandingCallbacks = {
            onStart: () => {
                this.startBoardDraftEditor()
            }
        }

        return new LandingController(callbacks)
    }

    private createBoardDraftController(): BoardDraftController {
        const callbacks: BoardDraftCallbacks = {
            onSubmitBoard: () => {
                this.startPreGameSetup()
            }
        }

        return new BoardDraftController(callbacks)
    }

    private createPreGameSetupController(boardDraft: BoardDraft): PreGameSetupController {
        const callbacks: PreGameSetupCallbacks = {
                onStartGame: () => {
                    this.startGameFlow()
                }
            }
        
        return new PreGameSetupController(callbacks, boardDraft)
    }

    private createGameController(game: Game): GameController {
        const callbacks: GameCallbacks = {
            onEndGame: () => {
                this.endGame()
            }
        }

        const buzzerKeyResolver = new Map<string, string>()

        for (const playerId in this.buzzerKeys) {
            buzzerKeyResolver.set(this.buzzerKeys[playerId], playerId)
        }

        return new GameController(callbacks, game, buzzerKeyResolver)
    }

    private createGameEndController(snapshot: GameUISnapshot): GameEndController {
        const callbacks: GameEndCallbacks = {
            onStartNewGame: () => {
                this.startBoardDraftEditor()
            }
        }
        
        return new GameEndController(callbacks, snapshot)
    }

    /* ---------- Helpers ---------- */

    private assertPhase(expected: AppPhase[]): void {
        if (this.phase in expected) {
            throw new Error(
                `Invalid action for phase ${this.phase}, expected ${expected}`
            )
        }
    }
}

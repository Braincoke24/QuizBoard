// src/ui/game/GameController.ts
import { Game } from "../../game/Game.js"
import { GameAction } from "./GameAction.js"
import { GameUISnapshot } from "./state/GameUISnapshot.js"
import { GameUIState } from "./state/GameUIState.js"
import { PlayerResolver } from "../../shared/PlayerResolver.js"
import { GameCallbacks } from "./GameCallbacks.js"

/**
 * Controls the game during the GAME_RUNNING phase.
 * Mutates the domain game and exposes a read-only UI snapshot.
 */
export class GameController {
    private readonly uiState: GameUIState
    private readonly playerResolver: PlayerResolver
    private _actionPastHistory: GameAction[] = []
    private _actionFutureHistory: GameAction[] = []
    private isRedoingAction: boolean = false

    constructor(
        private readonly callbacks: GameCallbacks,
        private readonly game: Game,
        private readonly buzzerKeyResolver: Map<string, string> | null = null,
    ) {
        this.uiState = new GameUIState(game)
        this.playerResolver = new PlayerResolver(game.players)
    }

    /* ---------- Public API ---------- */

    public dispatch(action: GameAction): void {
        switch (action.type) {
            case "GAME/SELECT_QUESTION": {
                if (!this.uiState.canSelectQuestion()) {
                    throw new Error(
                        "Cannot select a question in the current turn state",
                    )
                }

                this.game.selectQuestion(
                    action.categoryIndex,
                    action.questionIndex,
                )
                this._actionPastHistory.push(action)
                break
            }

            case "GAME/BUZZ": {
                if (!this.uiState.canBuzz(action.playerId)) {
                    throw new Error("Player is not allowed to buzz right now")
                }

                this.game.buzz(this.playerResolver.resolve(action.playerId))
                this._actionPastHistory.push(action)
                break
            }

            case "GAME/ANSWER": {
                if (!this.uiState.canAnswer()) {
                    throw new Error("Cannot answer in the current turn state")
                }

                this.game.answer(action.correct)
                this._actionPastHistory.push(action)
                break
            }

            case "GAME/PASS": {
                if (!this.uiState.canPass()) {
                    throw new Error("Cannot pass in the current turn state")
                }

                this.game.pass()
                this._actionPastHistory.push(action)
                break
            }

            case "GAME/CONTINUE": {
                if (!this.uiState.canContinue()) {
                    throw new Error("Cannot continue in the current turn state")
                }

                this.game.continue()

                if (this.uiState.gameEndedNaturally()) {
                    this.callbacks.onEndGame()
                }

                this._actionPastHistory.push(action)
                break
            }

            case "GAME/PRESS_KEY": {
                if (!this.buzzerKeyResolver) return

                const playerId = this.buzzerKeyResolver.get(action.key)

                if (!playerId) return

                const buzzAction: GameAction = {
                    type: "GAME/BUZZ",
                    playerId: playerId,
                }

                this.dispatch(buzzAction)
                break
            }

            case "GAME/UNDO": {
                const lastAction = this._actionPastHistory.pop()
                if (!lastAction) throw new Error("No action to undo")

                this.undoAction(lastAction)
                break
            }

            case "GAME/REDO":
                const nextAction = this._actionFutureHistory.shift()
                if (!nextAction) throw new Error("No action to redo")

                if (
                    nextAction.type === "GAME/PRESS_KEY" ||
                    nextAction.type === "GAME/UNDO" ||
                    nextAction.type === "GAME/REDO"
                )
                    throw new Error(`Can't redo ${nextAction}`)

                this.isRedoingAction = true
                this.dispatch(nextAction)
                break

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled GameAction: ${exhaustive}`)
            }
        }
        if (this.isRedoingAction) {
            this.isRedoingAction = false
        } else if (
            action.type !== "GAME/UNDO" &&
            action.type !== "GAME/REDO" &&
            action.type !== "GAME/PRESS_KEY"
        ) {
            this._actionFutureHistory = []
        }
    }

    /**
     * Returns a serializable snapshot for rendering.
     */
    public getSnapshot(): GameUISnapshot {
        return this.uiState.createSnapshot()
    }

    private undoAction(lastAction: GameAction): void {
        if (
            lastAction.type === "GAME/PRESS_KEY" ||
            lastAction.type === "GAME/UNDO" ||
            lastAction.type === "GAME/REDO"
        )
            throw new Error(`Can't undo ${lastAction}`)

        switch (lastAction.type) {
            case "GAME/SELECT_QUESTION":
                this.game.undoSelectQuestion()
                break

            case "GAME/ANSWER":
                this.game.undoAnswer()
                break

            case "GAME/BUZZ":
                this.game.undoBuzz()
                break

            case "GAME/PASS":
                this.game.undoPass()
                break

            case "GAME/CONTINUE":
                this.game.undoContinue()
                break

            default:
                const exhaustive: never = lastAction
                throw new Error(`Can't undo ${exhaustive}`)
        }

        this._actionFutureHistory.unshift(lastAction)
    }

    public canUndo(): boolean {
        return this._actionPastHistory.length > 0
    }

    public canRedo(): boolean {
        return this._actionFutureHistory.length > 0
    }

    public get actionPastHistory(): GameAction[] {
        return this._actionPastHistory
    }

    public get actionFutureHistory(): GameAction[] {
        return this._actionFutureHistory
    }
}

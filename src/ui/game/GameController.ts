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
    private actionPastHistory: GameAction[] = []
    private actionFutureHistory: GameAction[] = []

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
                this.actionPastHistory.push(action)
                return
            }

            case "GAME/BUZZ": {
                if (!this.uiState.canBuzz(action.playerId)) {
                    throw new Error("Player is not allowed to buzz right now")
                }

                this.game.buzz(this.playerResolver.resolve(action.playerId))
                this.actionPastHistory.push(action)
                return
            }

            case "GAME/ANSWER": {
                if (!this.uiState.canAnswer()) {
                    throw new Error("Cannot answer in the current turn state")
                }

                this.game.answer(action.correct)
                this.actionPastHistory.push(action)
                return
            }

            case "GAME/PASS": {
                if (!this.uiState.canPass()) {
                    throw new Error("Cannot pass in the current turn state")
                }

                this.game.pass()
                this.actionPastHistory.push(action)
                return
            }

            case "GAME/CONTINUE": {
                if (!this.uiState.canContinue()) {
                    throw new Error("Cannot continue in the current turn state")
                }

                this.game.continue()

                if (this.uiState.gameEndedNaturally()) {
                    this.callbacks.onEndGame()
                }

                this.actionPastHistory.push(action)
                return
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
                return
            }

            case "GAME/UNDO": {
                // TODO: write tests for UNDO
                // TODO: make back buttons
                const lastAction = this.actionPastHistory.pop()
                if (!lastAction) throw new Error("No action to undo")

                this.undoAction(lastAction)
                return
            }

            case "GAME/REDO":
                const nextAction = this.actionFutureHistory.shift()
                if (!nextAction) throw new Error("No action to redo")

                if (
                    nextAction.type === "GAME/PRESS_KEY" ||
                    nextAction.type === "GAME/UNDO" ||
                    nextAction.type === "GAME/REDO"
                )
                    throw new Error(`Can't redo ${nextAction}`)

                this.dispatch(nextAction)
                return

            default: {
                const exhaustive: never = action
                throw new Error(`Unhandled GameAction: ${exhaustive}`)
            }
        }
    }

    /**
     * Returns a serializable snapshot for rendering.
     */
    public getSnapshot(): GameUISnapshot {
        return this.uiState.createSnapshot()
    }

    private undoAction(lastAction: GameAction): void {
        this.actionFutureHistory.unshift(lastAction)

        if (
            lastAction.type === "GAME/PRESS_KEY" ||
            lastAction.type === "GAME/UNDO" ||
            lastAction.type === "GAME/REDO"
        )
            throw new Error(`Can't undo ${lastAction}`)

        switch (lastAction.type) {
            case "GAME/SELECT_QUESTION":
                this.game.undoSelectQuestion()
                return

            case "GAME/ANSWER":
                this.game.undoAnswer()
                return

            case "GAME/BUZZ":
                this.game.undoBuzz()
                return

            case "GAME/PASS":
                this.game.undoPass()
                return

            case "GAME/CONTINUE":
                this.game.undoContinue()
                return

            default:
                const exhaustive: never = lastAction
                throw new Error(`Can't undo ${exhaustive}`)
        }
    }
}

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

    constructor(
        private readonly callbacks: GameCallbacks,
        private readonly game: Game,
        private readonly buzzerKeyResolver: Map<string, string> | null = null
    ) {
        this.uiState = new GameUIState(game)
        this.playerResolver = new PlayerResolver(game.players)
    }

    /* ---------- Public API ---------- */

    public dispatch(action: GameAction): void {
        switch (action.type) {
            case "GAME/SELECT_QUESTION": {
                if (!this.uiState.canSelectQuestion()) {
                    throw new Error("Cannot select a question in the current turn state")
                }

                this.game.selectQuestion(
                    action.categoryIndex,
                    action.questionIndex
                )
                return
            }

            case "GAME/BUZZ": {
                if (!this.uiState.canBuzz(action.playerId)) {
                    throw new Error("Player is not allowed to buzz right now")
                }

                this.game.buzz(
                    this.playerResolver.resolve(action.playerId)
                )
                return
            }

            case "GAME/ANSWER": {
                if (!this.uiState.canAnswer()) {
                    throw new Error("Cannot answer in the current turn state")
                }

                this.game.answer(action.correct)
                return
            }

            case "GAME/PASS": {
                if (!this.uiState.canPass()) {
                    throw new Error("Cannot pass in the current turn state")
                }

                this.game.pass()
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
                
                return
            }

            case "GAME/PRESS_KEY": {
                if (!this.buzzerKeyResolver) return

                const playerId = this.buzzerKeyResolver.get(action.key)
                
                if (!playerId) return

                if (!this.uiState.canBuzz(playerId)) {
                    throw new Error("Player is not allowed to buzz right now")
                }

                this.game.buzz(
                    this.playerResolver.resolve(playerId)
                )
                return
            }

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
}

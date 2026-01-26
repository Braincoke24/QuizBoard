// src/ui/controllers/GameController.ts
import { Game } from "../../game/Game.js"
import { GameUIState } from "./state/GameUIState.js"
import { PlayerResolver } from "../../shared/PlayerResolver.js"

/**
 * Command API for the UI.
 * This is the only place where the UI is allowed to mutate the game.
 */
export class GameUIController {
    private readonly game: Game
    private readonly uiState: GameUIState
    private readonly playerResolver: PlayerResolver

    /**
     * Creates a controller for a given game instance.
     */
    public constructor(game: Game) {
        this.game = game
        this.uiState = new GameUIState(game)
        this.playerResolver = new PlayerResolver(game.players)
    }

    /**
     * Returns the current read-only UI projection.
     */
    public getUIState(): GameUIState {
        return this.uiState
    }

    /**
     * Selects a question from the board by index.
     */
    public selectQuestion(categoryIndex: number, questionIndex: number): void {
        if (!this.uiState.canSelectQuestion()) {
            throw new Error("Cannot select a question in the current turn state")
        }

        this.game.selectQuestion(categoryIndex, questionIndex)
    }

    /**
     * Lets a player buzz in.
     */
    public buzz(playerId: string): void {
        if (!this.uiState.canBuzz(playerId)) {
            throw new Error("Player is not allowed to buzz right now")
        }

        this.game.buzz(this.playerResolver.resolve(playerId))
    }

    /**
     * Submits an answer result for the active player.
     */
    public answer(correct: boolean): void {
        if (!this.uiState.canAnswer()) {
            throw new Error("Cannot answer in the current turn state")
        }

        this.game.answer(correct)
    }

    /**
     * Passes the current buzzing phase.
     */
    public pass(): void {
        if (!this.uiState.canPass()) {
            throw new Error("Cannot pass in the current turn state")
        }

        this.game.pass()
    }
}

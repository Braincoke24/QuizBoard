// src/ui/GameController.ts
import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"
import { GameUIState } from "./GameUIState.js"

/**
 * Command API for the UI.
 * This is the only place where the UI is allowed to mutate the game.
 */
export class GameController {
    private readonly game: Game
    private readonly uiState: GameUIState

    /**
     * Creates a controller for a given game instance.
     */
    public constructor(game: Game) {
        this.game = game
        this.uiState = new GameUIState(game)
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
    public buzz(player: Player): void {
        if (!this.uiState.canBuzz(player)) {
            throw new Error("Player is not allowed to buzz right now")
        }

        this.game.buzz(player)
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

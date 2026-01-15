// src/ui/GameUIState.ts
import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"
import { TurnState } from "../game/TurnState.js"
import { Question } from "../game/Question.js"

/**
 * Read-only projection of the current game state
 * It exposes everything the UI needs to know about the current game state,
 * without exposing any game logic or allowing mutation.
 */
export class GameUIState {
    private readonly game: Game

    /**
     * Creates a new UI state wrapper for the given game instance.
     */
    public constructor(game: Game) {
        this.game = game
    }

    /**
     * Returns the player whose turn is currently active.
     */
    public getTurnStartingPlayer(): Player {
        return this.game.turn.startingPlayer
    }
    
    /**
     * Returns all players in play order.
     */
    public getPlayers(): readonly Player[] {
        return this.game.players
    }

    /**
     * Returns true if a new question can currently be selected.
     */
    public canSelectQuestion(): boolean {
        return this.game.turn.canSelectQuestion()
    }

    /**
     * Returns true if the given player is allowed to buzz right now.
     */
    public canBuzz(player: Player): boolean {
        return this.game.turn.canBuzz(player)
    }

    /**
     * Returns true if the current player is allowed to answer right now.
     */
    public canAnswer(): boolean {
        return this.game.turn.canAnswer()
    }

    /**
     * Returns true if the active player is allowed to pass.
     */
    public canPass(): boolean {
        return this.game.turn.canPass()
    }

    /**
     * Returns a lightweight snapshot of the game board for rendering.
     */
    public getBoard(): readonly CategoryUIState[] {
        return this.game.categories.map((category) => {
            return {
                name: category.name,
                questions: category.questions.map((question) => {
                    return {
                        value: question.value,
                        isAvailable: !question.asked
                    }
                })
            }
        })
    }

    /**
     * Returns the current turn state.
     */
    public getTurnState(): TurnState {
        return this.game.turn.state
    }

    /**
     * Returns a lightweight snapshot of the currently active question, if any.
     */
    public getActiveQuestion(): ActiveQuestionUIState | null {
        const q = this.game.turn.question
        if (!q) return null

        return {
            value: q.value,
            text: q.text
        }
    }


    /**
     * Returns the player who is currently answering or buzzing.
     */
    public getActivePlayer(): Player {
        return this.game.turn.activePlayer
    }

}

/**
 * UI-friendly view of a category.
 */
export interface CategoryUIState {
    name: string
    questions: readonly QuestionUIState[]
}

/**
 * UI-friendly view of a single question tile.
 */
export interface QuestionUIState {
    value: number
    isAvailable: boolean
}

/**
 * UI-friendly view of a single question.
 */
export interface ActiveQuestionUIState {
    value: number
    text: string
}


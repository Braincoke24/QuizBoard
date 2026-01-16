// src/ui/GameUIState.ts
import { Game } from "../game/Game.js"
import { Player } from "../game/Player.js"
import { TurnState } from "../game/TurnState.js"
import { PlayerResolver } from "../shared/PlayerResolver.js"

/**
 * Read-only projection of the current game state
 * It exposes everything the UI needs to know about the current game state,
 * without exposing any game logic or allowing mutation.
 */
export class GameUIState {
    private readonly game: Game
    private readonly playerResolver: PlayerResolver

    /**
     * Creates a new UI state wrapper for the given game instance.
     */
    public constructor(game: Game) {
        this.game = game
        this.playerResolver = new PlayerResolver(game.players)
    }

    private resolvePlayerUIState(player: Player): PlayerUIState {
        return {
            id: player.id,
            name: player.name,
            score: player.score,
            isActive: (this.game.turn.activePlayer === player),
            isLockedOut: (this.game.turn.isLockedOut(player))
        }
    }

    /**
     * Returns the starting player of the current turn.
     */
    public getTurnStartingPlayer(): PlayerUIState {
        return this.resolvePlayerUIState(this.game.turn.startingPlayer)
    }

    /**
     * Returns all players in play order.
     */
    public getPlayers(): readonly PlayerUIState[] {
        return this.game.players.map((player) => {
            return this.resolvePlayerUIState(player)
        })
    }

    /**
     * Returns true if a new question can currently be selected.
     */
    public canSelectQuestion(): boolean {
        if (!this.game.turn) {
            return false
        }

        return this.game.turn.canSelectQuestion()
    }

    /**
     * Returns true if the given player is allowed to buzz right now.
     */
    public canBuzz(uiPlayer: PlayerUIState): boolean {
        if (!this.game.turn) {
            return false
        }

        return this.game.turn.canBuzz(this.playerResolver.resolve(uiPlayer))
    }

    /**
     * Returns true if the current player is allowed to answer right now.
     */
    public canAnswer(): boolean {
        if (!this.game.turn) {
            return false
        }

        return this.game.turn.canAnswer()
    }

    /**
     * Returns true if the active player is allowed to pass.
     */
    public canPass(): boolean {
        if (!this.game.turn) {
            return false
        }

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
    public getActivePlayer(): PlayerUIState {
        return this.resolvePlayerUIState(this.game.turn.activePlayer)
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

/**
 * UI-friendly view of a player.
 */
export interface PlayerUIState {
    id: string
    name: string
    score: number
    isActive: boolean
    isLockedOut: boolean
}

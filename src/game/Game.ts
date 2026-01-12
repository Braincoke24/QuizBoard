import { Player } from "./Player.js"
import { Board } from "./Board.js"
import { Turn } from "./Turn.js"

/**
 * The Game class represents an entire Jeopardy-style match.
 *
 * It owns:
 * - The list of players
 * - The board of questions
 * - The active turn
 *
 * The Game coordinates turns but does NOT implement turn logic itself.
 * That responsibility is delegated to the Turn class.
 */
export class Game {
    /** All players in play order */
    private _players: Player[]

    /** The game board containing all categories and questions */
    private _board: Board

    /** Index of the player whose turn it currently is */
    private _currentPlayerIndex = 0

    /** The active turn (always defined after construction) */
    private _turn!: Turn

    /**
     * Creates a new game.
     *
     * @param players The players in play order
     * @param board The question board
     */
    constructor(players: Player[], board: Board) {
        this._players = players
        this._board = board

        // Immediately start the first turn
        this.startTurn()
    }

    /**
     * Starts a new turn for the current player.
     * This is called automatically after each turn resolves.
     */
    private startTurn() {
        const player = this._players[this._currentPlayerIndex]

        this._turn = new Turn(player, this._players, (turn) => {
            this.onTurnResolved(turn)
        })
    }

    /**
     * Called by a Turn when it finishes.
     * Advances to the next player and starts a new turn.
     */
    private onTurnResolved(turn: Turn) {
        this.advancePlayer()
        this.startTurn()
    }

    /**
     * Advances the current player index in a circular fashion.
     */
    private advancePlayer() {
        this._currentPlayerIndex =
            (this._currentPlayerIndex + 1) % this._players.length
    }

    // =========================
    // Public API (called by UI)
    // =========================

    /**
     * Selects a question for the current turn.
     *
     * @param categoryIndex Index of the category
     * @param questionIndex Index of the question in that category
     */
    selectQuestion(categoryIndex: number, questionIndex: number) {
        const question = this._board.getQuestion(categoryIndex, questionIndex)
        this._turn.selectQuestion(question)
    }

    /**
     * Submits an answer for the current player.
     *
     * @param correct Whether the answer was correct
     */
    answer(correct: boolean) {
        this._turn.submitAnswer(correct)
    }

    /**
     * Allows another player to buzz in.
     *
     * @param player The buzzing player
     */
    buzz(player: Player) {
        this._turn.buzz(player)
    }

    /**
     * Ends the current turn without another buzz.
     * Used when no one wants to attempt the question.
     */
    pass() {
        this._turn.pass()
    }

    /** The currently active turn */
    get turn() {
        return this._turn
    }

    /** The player whose turn it currently is */
    get currentPlayer() {
        return this._players[this._currentPlayerIndex]
    }
}

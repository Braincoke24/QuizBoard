// src/game/Game.ts
import { Player } from "./Player.js"
import { Board } from "./board/Board.js"
import { Turn } from "./turn/Turn.js"
import { GameRules } from "./GameRules.js"

/**
 * Coordinates players, turns, and the board.
 * Acts as the public API for the UI.
 */
export class Game {
    private _players: Player[]
    private _board: Board
    private _rules: GameRules
    private _currentPlayerIndex = 0
    private _turn!: Turn

    constructor(players: Player[], board: Board, rules: GameRules) {
        this._players = players
        this._board = board
        this._rules = rules

        this.startTurn()
    }

    private startTurn() {
        const player = this._players[this._currentPlayerIndex]

        this._turn = new Turn(player, this._players, this._rules, () =>
            this.onTurnResolved(),
        )
    }

    private onTurnResolved() {
        this.advancePlayer()
        this.startTurn()
    }

    private advancePlayer() {
        this._currentPlayerIndex =
            (this._currentPlayerIndex + 1) % this._players.length
    }

    // =========================
    // Public API (UI / tests call these)
    // =========================

    /**
     * Selects a question from the board for the current turn.
     *
     * @param categoryIndex Index of the category
     * @param questionIndex Index of the question within the category
     * @throws Error if the turn is not in selecting state or the question is already asked
     */
    public selectQuestion(categoryIndex: number, questionIndex: number) {
        const category = this._board.categories[categoryIndex]
        const question = category.questions[questionIndex]

        this._turn.selectQuestion(question, category.name)
    }

    public undoSelectQuestion() {
        this._turn.undoSelectQuestion()
    }

    /**
     * Submits an answer for the current player.
     *
     * @param correct True if the answer is correct, false if incorrect
     * @throws Error if the turn is not in answering state or no question is selected
     */
    public answer(correct: boolean) {
        this._turn.submitAnswer(correct)
    }

    /**
     * Allows a player to buzz in during a buzzing phase.
     *
     * @param player The player who buzzes
     * @throws Error if not in buzzing phase or the player is locked out
     */
    public buzz(player: Player) {
        this._turn.buzz(player)
    }

    /**
     * Ends the current turn without another player buzzing.
     * Can be used if all players pass.
     *
     * @throws Error if not in buzzing phase
     */
    public pass() {
        this._turn.pass()
    }

    public continue() {
        this._turn.continue()
    }

    /** The current active turn */
    get turn() {
        return this._turn
    }

    /** All players in play order. */
    get players() {
        return this._players
    }

    /** The player whose turn it is to select a question */
    get currentPlayer() {
        return this._players[this._currentPlayerIndex]
    }

    /** All categories on the board */
    get categories() {
        return this._board.categories
    }
}

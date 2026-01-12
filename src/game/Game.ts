import { Player } from "./Player.js"
import { Board } from "./Board.js"
import { Turn } from "./Turn.js"

export class Game {
    private _players: Player[]
    private _board: Board
    private _currentPlayerIndex = 0
    private _turn!: Turn

    constructor(players: Player[], board: Board) {
        this._players = players
        this._board = board

        this.startTurn()
    }

    private startTurn() {
        const player = this._players[this._currentPlayerIndex]

        this._turn = new Turn(player, this._players, (turn) => {
            this.onTurnResolved(turn)
        })
    }

    private onTurnResolved(turn: Turn) {
        this.advancePlayer()
        this.startTurn()
    }

    private advancePlayer() {
        this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length
    }

    // =========================
    // Public API (UI calls this)
    // =========================

    selectQuestion(categoryIndex: number, questionIndex: number) {
        const question = this._board.getQuestion(categoryIndex, questionIndex)
        this._turn.selectQuestion(question)
    }

    answer(correct: boolean) {
        this._turn.submitAnswer(correct)
    }

    buzz(player: Player) {
        this._turn.buzz(player)
    }

    pass() {
        this._turn.pass()
    }

    get turn() {
        return this._turn
    }

    get currentPlayer() {
        return this._players[this._currentPlayerIndex]
    }
}

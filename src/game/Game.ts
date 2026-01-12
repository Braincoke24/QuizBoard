import { Player } from "./Player.js"
import { Board } from "./Board.js"
import { Turn } from "./Turn.js"

export class Game {
    private _players: Player[]
    private _board: Board
    private _currentPlayerIndex = 0
    private _turn: Turn

    constructor(players: Player[], board: Board) {
        this._players = players
        this._board = board
        this._turn = new Turn(players[0])
    }

    startTurn() {
        this._turn = new Turn(this._players[this._currentPlayerIndex])
    }

    selectQuestion(cat: number, q: number) {
        const question = this._board.getQuestion(cat, q)
        this._turn.selectQuestion(question)
    }

    answer(correct: boolean) {
        this._turn.submitAnswer(correct)
    }

    buzz(player: Player) {
        this._turn.buzz(player)
    }

    nextPlayer() {
        this._currentPlayerIndex =
        (this._currentPlayerIndex + 1) % this._players.length
    }

    getTurn() {
        return this._turn
    }
}

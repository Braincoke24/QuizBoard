import { Player } from "./Player.js"
import { Question } from "./Question.js"
import { TurnState } from "./TurnState.js"

export class Turn {
    private readonly _startingPlayer: Player
    private readonly _players: Player[]
    private _state: TurnState
    private _currentPlayer: Player
    private _question?: Question
    private _attempted = new Set<Player>()
    private _firstAttemptDone = false
    private _onResolved?: (turn: Turn) => void

    constructor(
        startingPlayer: Player,
        players: Player[],
        onResolved?: (turn: Turn) => void
    ) {
        this._startingPlayer = startingPlayer
        this._players = players
        this._currentPlayer = startingPlayer
        this._state = TurnState.SELECTING
        this._onResolved = onResolved
    }

    private allPlayersHaveTried(): boolean {
        return this._attempted.size >= this._players.length
    }

    private resolve() {
        this._state = TurnState.RESOLVED
        this._onResolved?.(this)
    }

    get state() {
        return this._state
    }

    get currentPlayer() {
        return this._currentPlayer
    }

    get question() {
        return this._question
    }

    selectQuestion(q: Question) {
        if (this._state !== TurnState.SELECTING) {
            throw new Error("Not selecting")
        }
        if (q.asked) {
            throw new Error("Already asked")
        }
        this._question = q
        this._question.play()
        this._state = TurnState.ANSWERING
    }

    submitAnswer(correct: boolean) {
        if (this._state !== TurnState.ANSWERING){
            throw new Error("Not answering phase")
        }
        if (!this._question) {
            throw new Error("No question")
        }
        
        const value = this._question.value
        const player = this._currentPlayer

        if (correct) {
            if (!this._firstAttemptDone) {
                player.addScore(value)
            } else {
                player.addScore(value / 2)
            }
            this.resolve()
        } else {
            player.addScore(-value / 2)
            this._attempted.add(player)
            if (this.allPlayersHaveTried()) {
                this.resolve()
            } else {
                this._state = TurnState.BUZZING
            }
        }
        if (!this._firstAttemptDone && player === this._startingPlayer) {
            this._firstAttemptDone = true
        }
    }

    buzz(player: Player) {
        if (this._state !== TurnState.BUZZING){
            throw new Error("Not buzzing phase")
        }
        if (this._attempted.has(player)) {
            throw new Error("Player locked out")
        }
        
        this._currentPlayer = player
        this._state = TurnState.ANSWERING
    }

    pass() {
        if (this._state !== TurnState.BUZZING) {
            throw new Error("Not buzzing phase")
        }
        this.resolve()
    }
}

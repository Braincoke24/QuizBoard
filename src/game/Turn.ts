import { Player } from "./Player.js"
import { Question } from "./Question.js"
import { TurnState } from "./TurnState.js"

export class Turn {
    private _state: TurnState
    private _currentPlayer: Player
    private _question?: Question
    private _attempted = new Set<Player>()
    private _firstAttemptDone = false

    constructor(startingPlayer: Player) {
        this._currentPlayer = startingPlayer
        this._state = TurnState.SELECTING
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
        this._question = q
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
            this._state = TurnState.RESOLVED
        } else {
            player.addScore(-value / 2)
            this._attempted.add(player)
            this._state = TurnState.BUZZING
        }
        if (!this._firstAttemptDone) {
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
}

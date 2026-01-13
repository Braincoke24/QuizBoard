// src/game/Turn.ts
import { Player } from "./Player.js"
import { Question } from "./Question.js"
import { TurnState } from "./TurnState.js"
import { GameRules } from "./GameRules.js"

/**
 * Represents a single turn in the game.
 * Handles question selection, answering, buzzing and scoring.
 */
export class Turn {
    private readonly _startingPlayer: Player
    private readonly _players: Player[]
    private readonly _rules: GameRules

    private _state: TurnState
    private _currentPlayer: Player
    private _question?: Question
    private _attempted = new Set<Player>()
    private _firstAttemptDone = false
    private _onResolved?: (turn: Turn) => void

    /**
     * @param startingPlayer Player who selects the question
     * @param players All players in the game
     * @param rules Scoring rules
     * @param onResolved Callback fired when the turn ends
     */
    constructor(
        startingPlayer: Player,
        players: Player[],
        rules: GameRules,
        onResolved?: (turn: Turn) => void
    ) {
        this._startingPlayer = startingPlayer
        this._players = players
        this._rules = rules
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
        if (this._state !== TurnState.SELECTING) throw new Error("Not selecting")
        if (q.asked) throw new Error("Already asked")

        this._question = q
        q.play()
        this._state = TurnState.ANSWERING
    }

    submitAnswer(correct: boolean) {
        if (this._state !== TurnState.ANSWERING) throw new Error("Not answering")
        if (!this._question) throw new Error("No question")

        const value = this._question.value
        const player = this._currentPlayer
        const isStarter = (player === this._startingPlayer)

        if (correct) {
            const multiplier = isStarter
                ? 1
                : this._rules.buzzCorrectMultiplier

            player.addScore(value * multiplier)
            this.resolve()
        } else {
            const multiplier = isStarter
                ? this._rules.firstWrongMultiplier
                : this._rules.buzzWrongMultiplier

            player.addScore(-value * multiplier)
            this._attempted.add(player)

            if (this.allPlayersHaveTried()) {
                this.resolve()
            } else {
                this._state = TurnState.BUZZING
            }
        }

        if (!this._firstAttemptDone && isStarter) {
            this._firstAttemptDone = true
        }
    }

    buzz(player: Player) {
        if (this._state !== TurnState.BUZZING) throw new Error("Not buzzing")
        if (this._attempted.has(player)) throw new Error("Player locked out")

        this._currentPlayer = player
        this._state = TurnState.ANSWERING
    }

    /** Ends the turn without another buzz attempt */
    pass() {
        if (this._state !== TurnState.BUZZING) throw new Error("Not buzzing")
        this.resolve()
    }
}

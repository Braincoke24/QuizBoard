import { Player } from "./Player.js"
import { Question } from "./Question.js"
import { TurnState } from "./TurnState.js"

/**
 * Represents a single style turn for exactly one question.
 *
 * A Turn is responsible for:
 * - Tracking which player is currently answering
 * - Locking out players after wrong answers
 * - Handling buzzing
 * - Calculating full vs. half points
 * - Resolving itself when the question is finished
 */
export class Turn {
    /** The player who selected the question and has the first attempt */
    private readonly _startingPlayer: Player

    /** All players participating in this turn */
    private readonly _players: Player[]

    /** Current phase of the turn */
    private _state: TurnState

    /** Player who is currently allowed to answer */
    private _currentPlayer: Player

    /** The question being played this turn */
    private _question?: Question

    /** Players who already attempted and are locked out */
    private _attempted = new Set<Player>()

    /** True once the starting player has made their initial attempt */
    private _firstAttemptDone = false

    /** Optional callback fired when the turn is resolved */
    private _onResolved?: (turn: Turn) => void

    /**
     * Creates a new turn.
     *
     * @param startingPlayer The player who begins this turn
     * @param players All players participating
     * @param onResolved Optional callback triggered when the turn ends
     */
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

    /**
     * Returns true if every player has already attempted this question.
     * Used to decide whether the turn should automatically end.
     */
    private allPlayersHaveTried(): boolean {
        return this._attempted.size >= this._players.length
    }

    /**
     * Resolves the turn and notifies the Game via callback.
     */
    private resolve() {
        this._state = TurnState.RESOLVED
        this._onResolved?.(this)
    }

    /** Current phase of the turn */
    get state() {
        return this._state
    }

    /** Player who is currently answering */
    get currentPlayer() {
        return this._currentPlayer
    }

    /** The active question, if one has been selected */
    get question() {
        return this._question
    }

    /**
     * Selects a question and starts the answering phase.
     *
     * @param q The question to play
     * @throws Error if not in SELECTING state or if the question was already used
     */
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

    /**
     * Submits the current player's answer.
     *
     * - Correct answers score full or half points
     * - Wrong answers subtract half points and lock the player out
     * - The turn resolves automatically when appropriate
     *
     * @param correct Whether the answer was correct
     * @throws Error if not in ANSWERING state
     */
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

        // The first attempt is defined by the starting player
        if (!this._firstAttemptDone && player === this._startingPlayer) {
            this._firstAttemptDone = true
        }
    }

    /**
     * Allows another player to buzz in and attempt an answer.
     *
     * @param player The buzzing player
     * @throws Error if not in BUZZING state or if the player is locked out
     */
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

    /**
     * Ends the turn without another player buzzing in.
     * Intended for UI use when nobody wants to attempt the question.
     *
     * @throws Error if not in BUZZING state
     */
    pass() {
        if (this._state !== TurnState.BUZZING) {
            throw new Error("Not buzzing phase")
        }
        this.resolve()
    }
}

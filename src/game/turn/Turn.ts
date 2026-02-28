// src/game/turn/Turn.ts
import { Player } from "../Player.js"
import { Question } from "../board/Question.js"
import { TurnPhase } from "./TurnPhase.js"
import { SelectedQuestion } from "../board/SelectedQuestion.js"
import { GameRules } from "../GameRules.js"

/**
 * Represents a single turn in the game.
 * Handles question selection, answering, buzzing and scoring.
 */
export class Turn {
    private readonly _startingPlayer: Player
    private readonly _players: Player[]
    private readonly _rules: GameRules

    private _phase: TurnPhase
    private _activePlayer: Player
    private _selectedQuestion?: SelectedQuestion
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
        onResolved?: (turn: Turn) => void,
    ) {
        this._startingPlayer = startingPlayer
        this._players = players
        this._rules = rules
        this._activePlayer = startingPlayer
        this._phase = TurnPhase.SELECTING
        this._onResolved = onResolved
    }

    private allPlayersHaveTried(): boolean {
        return this._attempted.size >= this._players.length
    }

    private resolve() {
        this._phase = TurnPhase.RESOLVED
        this._onResolved?.(this)
    }

    get phase() {
        return this._phase
    }

    get activePlayer() {
        return this._activePlayer
    }

    get startingPlayer() {
        return this._startingPlayer
    }

    get question() {
        return this._selectedQuestion
    }

    public selectQuestion(question: Question, categoryName: string) {
        if (this._phase !== TurnPhase.SELECTING)
            throw new Error("Not selecting")
        if (question.asked) throw new Error("Already asked")

        this._selectedQuestion = {
            question: question,
            categoryName: categoryName,
        }
        question.play()
        this._phase = TurnPhase.ANSWERING
    }

    public submitAnswer(correct: boolean) {
        if (this._phase !== TurnPhase.ANSWERING)
            throw new Error("Not answering")
        if (!this._selectedQuestion) throw new Error("No question")

        const value = this._selectedQuestion.question.value
        const player = this._activePlayer
        const isStarter = player === this._startingPlayer

        if (correct) {
            const multiplier = isStarter ? 1 : this._rules.buzzCorrectMultiplier
            player.addScore(value * multiplier)
            this._phase = TurnPhase.RESOLVING
        } else {
            const multiplier = isStarter
                ? this._rules.firstWrongMultiplier
                : this._rules.buzzWrongMultiplier
            player.addScore(-value * multiplier)
            this._attempted.add(player)

            if (this.allPlayersHaveTried()) {
                this._phase = TurnPhase.RESOLVING
            } else {
                this._phase = TurnPhase.BUZZING
            }
        }

        if (!this._firstAttemptDone && isStarter) {
            this._firstAttemptDone = true
        }
    }

    public buzz(player: Player) {
        if (this._phase !== TurnPhase.BUZZING) throw new Error("Not buzzing")
        if (this._attempted.has(player)) throw new Error("Player locked out")

        this._activePlayer = player
        this._phase = TurnPhase.ANSWERING
    }

    /** Ends the turn without another buzz attempt */
    public pass() {
        if (this._phase !== TurnPhase.BUZZING) throw new Error("Not buzzing")
        this._phase = TurnPhase.RESOLVING
    }

    public continue() {
        if (this._phase !== TurnPhase.RESOLVING)
            throw new Error("Not resolving")
        this.resolve()
    }

    public canBuzz(player: Player) {
        const isBuzzing = this._phase === TurnPhase.BUZZING
        const isLockedOut = this._attempted.has(player)

        return isBuzzing && !isLockedOut
    }

    public canAnswer() {
        const isAnswering = this._phase === TurnPhase.ANSWERING
        const hasQuestion = this._selectedQuestion !== undefined

        return isAnswering && hasQuestion
    }

    public canPass() {
        return this._phase === TurnPhase.BUZZING
    }

    public canSelectQuestion() {
        return this._phase === TurnPhase.SELECTING
    }

    public canContinue(): boolean {
        return this._phase === TurnPhase.RESOLVING
    }

    /**
     * Returns true if the given player has already failed this question.
     */
    public isLockedOut(player: Player): boolean {
        return this._attempted.has(player)
    }
}

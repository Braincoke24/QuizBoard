// src/game/Question.ts
/**
 * A single question on the board.
 */
export class Question {
    readonly text: string
    readonly answer: string
    readonly value: number
    private _asked = false

    constructor(text: string, answer: string, value: number) {
        this.text = text
        this.answer = answer
        this.value = value
    }

    /** Whether this question has already been asked */
    get asked() {
        return this._asked
    }

    /** Marks the question as asked */
    play() {
        this._asked = true
    }
}

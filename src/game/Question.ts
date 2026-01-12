/**
 * Represents a single Jeopardy question.
 */
export class Question {
    /** The question text shown to players */
    readonly text: string

    /** The correct answer */
    readonly answer: string

    /** Point value of the question */
    readonly value: number

    /** Whether the question has already been played */
    private _asked = false

    /**
     * @param text The question text
     * @param answer The correct answer
     * @param value The point value
     */
    constructor(text: string, answer: string, value: number) {
        this.text = text
        this.answer = answer
        this.value = value
    }

    /** Whether the question has already been asked */
    get asked() {
        return this._asked
    }

    /**
     * Marks the question as played.
     * Called when the question is selected in a turn.
     */
    play() {
        this._asked = true
    }
}

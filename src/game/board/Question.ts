// src/game/board/Question.ts
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

    get asked() {
        return this._asked
    }

    /** Marks the question as asked */
    public play() {
        this._asked = true
    }
}

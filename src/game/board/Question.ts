// src/game/board/Question.ts
export class Question {
    private _asked = false

    constructor(
        readonly text: string,
        readonly answer: string,
        readonly value: number,
        readonly questionMediaId?: string,
        readonly answerMediaId?: string,
    ) {}

    get asked() {
        return this._asked
    }

    /** Marks the question as asked */
    public play() {
        this._asked = true
    }
}

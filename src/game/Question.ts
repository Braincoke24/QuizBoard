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
}

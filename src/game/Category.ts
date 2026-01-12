import { Question } from "./Question.js"

export class Category {
    readonly name: string
    readonly questions: Question[]

    constructor(name: string, questions: Question[]) {
        this.name = name
        this.questions = questions
    }
}

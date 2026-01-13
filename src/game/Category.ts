// src/game/Category.ts
import { Question } from "./Question.js"

/**
 * A category on the game board, holding multiple questions.
 */
export class Category {
    readonly name: string
    readonly questions: Question[]

    constructor(name: string, questions: Question[]) {
        this.name = name
        this.questions = questions
    }
}

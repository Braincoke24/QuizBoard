import { Category } from "./Category.js"
import { Question } from "./Question.js"

export class Board {
    readonly categories: Category[]

    constructor(categories: Category[]) {
        this.categories = categories
    }

    getQuestion(categoryIndex: number, questionIndex: number): Question {
        return this.categories[categoryIndex].questions[questionIndex]
    }
}

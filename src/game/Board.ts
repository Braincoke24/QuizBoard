import { Category } from "./Category.js"
import { Question } from "./Question.js"

/**
 * Represents the game board, containing categories and their questions.
 */
export class Board {
    readonly categories: Category[]

    constructor(categories: Category[]) {
        this.categories = categories
    }

    /**
     * Returns a specific question from the board.
     * @param categoryIndex Index of the category
     * @param questionIndex Index of the question within the category
     */
    getQuestion(categoryIndex: number, questionIndex: number): Question {
        return this.categories[categoryIndex].questions[questionIndex]
    }
}

import { Category } from "./Category.js"
import { Question } from "./Question.js"

/**
 * Represents the full Jeopardy board.
 * A board consists of multiple categories, each containing questions.
 */
export class Board {
    /** All categories on the board */
    readonly categories: Category[]

    /**
     * @param categories The categories that make up the board
     */
    constructor(categories: Category[]) {
        this.categories = categories
    }

    /**
     * Returns a specific question by its category and question index.
     *
     * @param categoryIndex Index of the category
     * @param questionIndex Index of the question within the category
     */
    getQuestion(categoryIndex: number, questionIndex: number): Question {
        return this.categories[categoryIndex].questions[questionIndex]
    }
}

import { Question } from "./Question.js"

/**
 * A category groups multiple questions under a common theme.
 */
export class Category {
    /** Name of the category */
    readonly name: string

    /** Questions belonging to this category */
    readonly questions: Question[]

    /**
     * @param name Category title
     * @param questions Questions in this category
     */
    constructor(name: string, questions: Question[]) {
        this.name = name
        this.questions = questions
    }
}

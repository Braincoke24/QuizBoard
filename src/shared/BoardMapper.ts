// src/shared/BoardMapper.ts
import { Board } from "../game/board/Board.js"
import { Category } from "../game/board/Category.js"
import { Question } from "../game/board/Question.js"

import { BoardDraft } from "../ui/editBoard/BoardDraftState.js"

/**
 * Transforms a UI BoardDraft into a domain Board.
 * This is a pure mapping function without side effects.
 */
export function boardDraftToBoard(draft: BoardDraft): Board {
    const categories = draft.categories.map((categoryDraft) => {
        const questions = categoryDraft.questions.map(
            (questionDraft, rowIndex) => {
                return new Question(
                    questionDraft.questionText,
                    questionDraft.answerText,
                    draft.rowValues[rowIndex],
                )
            },
        )

        return new Category(categoryDraft.name, questions)
    })

    return new Board(categories)
}

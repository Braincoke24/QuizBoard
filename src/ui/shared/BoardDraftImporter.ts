// src/ui/shared/BoardDraftImporter.ts
import {
    BoardDraft,
    CategoryDraft,
    QuestionDraft,
} from "../editBoard/BoardDraftState.js"

export function importBoardDraft(raw: unknown): BoardDraft {
    if (!isObject(raw)) {
        throw new Error("Invalid board format")
    }

    const categories = raw.categories
    const rowValues = raw.rowValues

    if (!Array.isArray(categories) || !Array.isArray(rowValues)) {
        throw new Error("Invalid board structure")
    }

    const parsedCategories: CategoryDraft[] = categories.map((cat, cIndex) => {
        if (
            !isObject(cat) ||
            typeof cat.name !== "string" ||
            !Array.isArray(cat.questions)
        ) {
            throw new Error(`Invalid category at index ${cIndex}`)
        }

        const questions: QuestionDraft[] = cat.questions.map((q, qIndex) => {
            if (
                !isObject(q) ||
                typeof q.questionText !== "string" ||
                typeof q.answerText !== "string" ||
                !isOptionalString(q.questionMediaId) ||
                !isOptionalString(q.answerMediaId)
            ) {
                console.log(typeof q.answerMediaId)
                throw new Error(
                    `Invalid question at category ${cIndex}, row ${qIndex}`,
                )
            }

            return {
                questionText: q.questionText,
                answerText: q.answerText,
                questionMediaId: q.questionMediaId,
                answerMediaId: q.answerMediaId,
            }
        })

        return {
            name: cat.name,
            questions,
        }
    })

    return {
        categories: parsedCategories,
        rowValues: rowValues.map(Number),
    }
}

/* ---------- helpers ---------- */

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || typeof value === "string"
}

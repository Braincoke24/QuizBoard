// src/ui/shared/BoardDraftImporter.ts
import { BoardDraft, CategoryDraft, QuestionDraft } from "../editBoard/BoardDraftState.js"

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
        if (!isObject(cat) || typeof cat.name !== "string" || !Array.isArray(cat.questions)) {
            throw new Error(`Invalid category at index ${cIndex}`)
        }

        const questions: QuestionDraft[] = cat.questions.map((q, qIndex) => {
            if (
                !isObject(q) ||
                typeof q.text !== "string" ||
                typeof q.answer !== "string"
            ) {
                throw new Error(`Invalid question at category ${cIndex}, row ${qIndex}`)
            }

            return {
                text: q.text,
                answer: q.answer
            }
        })

        return {
            name: cat.name,
            questions
        }
    })

    return {
        categories: parsedCategories,
        rowValues: rowValues.map(Number)
    }
}

/* ---------- helpers ---------- */

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

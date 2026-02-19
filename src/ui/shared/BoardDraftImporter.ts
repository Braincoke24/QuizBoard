// src/ui/shared/BoardDraftImporter.ts
import {
    BoardDraft,
    CategoryDraft,
    MediaDraft,
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
                typeof q.text !== "string" ||
                typeof q.answer !== "string"
            ) {
                throw new Error(
                    `Invalid question at category ${cIndex}, row ${qIndex}`,
                )
            }

            let questionMedia: MediaDraft | undefined
            let answerMedia: MediaDraft | undefined

            if (q.questionMedia !== undefined) {
                if (!isMediaDraft(q.questionMedia)) {
                    throw new Error(
                        `Invalid questionMedia at category ${cIndex}, row ${qIndex}`,
                    )
                }
                questionMedia = q.questionMedia
            }

            if (q.answerMedia !== undefined) {
                if (!isMediaDraft(q.answerMedia)) {
                    throw new Error(
                        `Invalid answerMedia at category ${cIndex}, row ${qIndex}`,
                    )
                }
                answerMedia = q.answerMedia
            }

            return {
                text: q.text,
                answer: q.answer,
                questionMedia: questionMedia,
                answerMedia: answerMedia,
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

/**
 * Runtime type guard for MediaDraft
 */
function isMediaDraft(value: unknown): value is MediaDraft {
    if (!isObject(value)) {
        return false
    }

    if (typeof value.id !== "string") {
        return false
    }

    if (value.type !== "image" && value.type !== "audio") {
        return false
    }

    return true
}

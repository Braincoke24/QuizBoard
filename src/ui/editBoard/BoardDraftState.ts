// src/ui/landing/renderers/BoardDraftState.ts

export interface BoardDraft {
    categories: CategoryDraft[]
    rowValues: number[]
}

export interface CategoryDraft {
    name: string
    questions: QuestionDraft[]
}

export interface QuestionDraft {
    text: string
    questionMediaId?: string
    answer: string
    answerMediaId?: string
}

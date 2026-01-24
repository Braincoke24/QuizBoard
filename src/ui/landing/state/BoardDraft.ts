// src/ui/landing/state/BoardDraft.ts

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
    answer: string
}

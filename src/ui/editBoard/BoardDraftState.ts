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
    answer: string
    questionMedia?: MediaDraft
    answerMedia?: MediaDraft
}

export interface MediaDraft {
    id: string
    type: MediaType
}

export type MediaType = "image" | "audio"

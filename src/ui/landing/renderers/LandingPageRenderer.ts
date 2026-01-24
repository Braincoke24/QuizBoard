// src/ui/landing/renderers/LandingPageRenderer.ts
import { BoardDraft } from "../state/BoardDraft.js"

export class LandingPageRenderer {
    private readonly root: HTMLElement
    private readonly onDraftChange: (draft: BoardDraft) => void
    private readonly onSubmitBoard: () => void
    private readonly onImportBoard: (json: unknown) => void

    constructor(
        root: HTMLElement,
        onDraftChange: (draft: BoardDraft) => void,
        onSubmitBoard: () => void,
        onImportBoard: (json: unknown) => void
    ) {
        this.root = root
        this.onDraftChange = onDraftChange
        this.onSubmitBoard = onSubmitBoard
        this.onImportBoard = onImportBoard
    }

    public render(draft: BoardDraft, boardLocked: boolean): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "landing-board"

        container.appendChild(this.renderHeaderRow(draft, boardLocked))
        container.appendChild(this.renderGrid(draft, boardLocked))
        container.appendChild(this.renderActions(boardLocked))

        this.root.appendChild(container)
    }

    /* ---------- Header ---------- */

    private renderHeaderRow(draft: BoardDraft, locked: boolean): HTMLElement {
        const header = document.createElement("div")
        header.className = "board-header"
        header.style.gridTemplateColumns = `80px repeat(${draft.categories.length}, 1fr)`

        header.appendChild(document.createElement("div")) // empty corner

        draft.categories.forEach((category, cIndex) => {
            const input = document.createElement("input")
            input.type = "text"
            input.placeholder = "Category"
            input.value = category.name
            input.disabled = locked

            input.oninput = () => {
                const next = structuredClone(draft)
                next.categories[cIndex].name = input.value
                this.onDraftChange(next)
            }

            header.appendChild(input)
        })

        return header
    }

    /* ---------- Grid ---------- */

    private renderGrid(draft: BoardDraft, locked: boolean): HTMLElement {
        const grid = document.createElement("div")
        grid.className = "board-grid"
        grid.style.gridTemplateColumns = `80px repeat(${draft.categories.length}, 1fr)`

        draft.rowValues.forEach((rowValue, rowIndex) => {
            // Row value
            const valueCell = document.createElement("div")
            valueCell.className = "row-value"
            valueCell.textContent = rowValue.toString()
            grid.appendChild(valueCell)

            // Questions
            draft.categories.forEach((category, cIndex) => {
                const cell = document.createElement("div")
                cell.className = "question-cell"

                const questionInput = document.createElement("textarea")
                questionInput.placeholder = "Question"
                questionInput.value = category.questions[rowIndex].text
                questionInput.disabled = locked

                questionInput.oninput = () => {
                    const next = structuredClone(draft)
                    next.categories[cIndex].questions[rowIndex].text =
                        questionInput.value
                    this.onDraftChange(next)
                }

                const answerInput = document.createElement("textarea")
                answerInput.placeholder = "Answer"
                answerInput.value = category.questions[rowIndex].answer
                answerInput.disabled = locked

                answerInput.oninput = () => {
                    const next = structuredClone(draft)
                    next.categories[cIndex].questions[rowIndex].answer =
                        answerInput.value
                    this.onDraftChange(next)
                }

                cell.appendChild(questionInput)
                cell.appendChild(answerInput)
                grid.appendChild(cell)
            })
        })

        return grid
    }

    /* ---------- Actions ---------- */

    private renderActions(locked: boolean): HTMLElement {
        const actions = document.createElement("div")
        actions.className = "landing-actions"

        if (!locked) {
            /* ---------- Import ---------- */

            const importLabel = document.createElement("label")
            importLabel.textContent = "Import board (JSON)"

            const importInput = document.createElement("input")
            importInput.type = "file"
            importInput.accept = "application/json"

            importInput.onchange = async () => {
                const file = importInput.files?.[0]
                if (!file) return

                try {
                    const text = await file.text()
                    const json = JSON.parse(text)
                    this.onImportBoard(json)
                } catch {
                    alert("Invalid JSON file")
                } finally {
                    // allow re-importing same file
                    importInput.value = ""
                }
            }

            importLabel.appendChild(importInput)
            actions.appendChild(importLabel)

            /* ---------- Submit ---------- */

            const submit = document.createElement("button")
            submit.textContent = "Submit board"
            submit.onclick = this.onSubmitBoard

            actions.appendChild(submit)
        }

        return actions
    }
}

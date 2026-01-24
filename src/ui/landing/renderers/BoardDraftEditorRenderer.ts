// src/ui/landing/renderers/BoardDraftEditorRenderer.ts
import { BoardDraft } from "../state/BoardDraft.js"

export class BoardDraftEditorRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly onDraftChange: (draft: BoardDraft) => void,
        private readonly onSubmitBoard: () => void,
        private readonly onImportBoard: (json: unknown) => void,
        private readonly onExportBoard: () => void
    ) {}

    public render(draft: BoardDraft): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "landing-board"

        container.appendChild(this.renderHeaderRow(draft))
        container.appendChild(this.renderGrid(draft))
        container.appendChild(this.renderActions())

        this.root.appendChild(container)
    }

    /* ---------- Header ---------- */

    private renderHeaderRow(draft: BoardDraft): HTMLElement {
        const header = document.createElement("div")
        header.className = "board-header"
        header.style.gridTemplateColumns = `80px repeat(${draft.categories.length}, 1fr)`

        header.appendChild(document.createElement("div")) // empty corner

        draft.categories.forEach((category, cIndex) => {
            const input = document.createElement("input")
            input.type = "text"
            input.placeholder = "Category"
            input.value = category.name

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

    private renderGrid(draft: BoardDraft): HTMLElement {
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

                questionInput.oninput = () => {
                    const next = structuredClone(draft)
                    next.categories[cIndex].questions[rowIndex].text =
                        questionInput.value
                    this.onDraftChange(next)
                }

                const answerInput = document.createElement("textarea")
                answerInput.placeholder = "Answer"
                answerInput.value = category.questions[rowIndex].answer

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

    private renderActions(): HTMLElement {
        const actions = document.createElement("div")
        actions.className = "landing-actions"

        const exportButton = document.createElement("button")
        exportButton.textContent = "Export board (JSON)"
        exportButton.onclick = () => this.onExportBoard()
        actions.appendChild(exportButton)

        /* ---------- Import ---------- */

        const importInput = document.createElement("input")
        importInput.type = "file"
        importInput.accept = "application/json"
        importInput.style.display = "none"

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
                importInput.value = ""
            }
        }

        const importButton = document.createElement("button")
        importButton.textContent = "Import board (JSON)"
        importButton.onclick = () => importInput.click()

        actions.appendChild(importButton)
        actions.appendChild(importInput)

        /* ---------- Submit ---------- */

        const submit = document.createElement("button")
        submit.textContent = "Submit board"
        submit.onclick = this.onSubmitBoard

        actions.appendChild(submit)

        return actions
    }
}

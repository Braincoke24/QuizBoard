// src/ui/landing/renderers/BoardDraftEditorRenderer.ts
import { BoardDraft } from "./BoardDraftState.js"

export class BoardDraftEditorRenderer {
    private localDraft: BoardDraft | null = null

    constructor(
        private readonly root: HTMLElement,
        private readonly onDraftChange: (draft: BoardDraft) => void,
        private readonly onSubmitBoard: () => void,
        private readonly onImportBoard: (json: unknown) => void,
        private readonly onExportBoard: () => void
    ) {
        console.log("Started BoardDraftEditorRenderer")
    }

    public render(draft: BoardDraft): void {
        this.localDraft = structuredClone(draft)

        this.root.innerHTML = ""
        this.root.classList.add("edit-board")

        const boardDraftContainer = document.createElement("div")
        boardDraftContainer.className = "board-draft"

        boardDraftContainer.appendChild(this.renderHeaderRow(draft))
        boardDraftContainer.appendChild(this.renderGrid(draft))

        const addButton = document.createElement("button")
        addButton.className = "board-draft-category-add"
        addButton.textContent = "+"
        addButton.onclick = () => {
            if (!this.localDraft) return
            this.localDraft.categories[this.localDraft.categories.length] = {
                name: "",
                questions: this.localDraft.rowValues.map(() => ({
                    text: "",
                    answer: ""
                }))
            }
            this.onDraftChange(structuredClone(this.localDraft))
        }
        addButton.disabled = (draft.categories.length > 6)

        boardDraftContainer.appendChild(addButton)

        this.root.appendChild(boardDraftContainer)
        this.root.appendChild(this.renderActions())
    }

    /* ---------- Header ---------- */

    private renderHeaderRow(draft: BoardDraft): HTMLElement {
        const header = document.createElement("div")
        header.className = "board-draft-header"

        const pointLabel = document.createElement("div")
        pointLabel.className = "board-draft-point-label"
        pointLabel.textContent = ""

        header.appendChild(pointLabel)

        draft.categories.forEach((category, cIndex) => {
            const categorieContainer = document.createElement("div")
            categorieContainer.className = "board-draft-category-container"

            const input = document.createElement("input")
            input.className = "board-draft-category"
            input.type = "text"
            input.placeholder = "Category"
            input.value = category.name

            input.oninput = () => {
                if (!this.localDraft) return
                this.localDraft.categories[cIndex].name = input.value
            }

            const deleteButton = document.createElement("button")
            deleteButton.className = "board-draft-category-delete"
            deleteButton.textContent = "Delete"
            deleteButton.onclick = () => {
                if (!this.localDraft) return
                this.localDraft.categories.splice(cIndex,1)
                this.onDraftChange(structuredClone(this.localDraft))
            }
            deleteButton.disabled = (draft.categories.length <= 1)

            categorieContainer.append(input, deleteButton)

            header.appendChild(categorieContainer)
        })

        return header
    }

    /* ---------- Grid ---------- */

    private renderGrid(draft: BoardDraft): HTMLElement {
        const grid = document.createElement("div")
        grid.className = "board-draft-grid"

        draft.rowValues.forEach((rowValue, rowIndex) => {
            const row = document.createElement("div")
            row.className = "board-draft-row"

            // Row value
            const valueInput = document.createElement("input")
            valueInput.className = "row-value"
            valueInput.type = "number"
            valueInput.min = "0"
            valueInput.value = rowValue.toString()

            valueInput.oninput = () => {
                if (!this.localDraft) return
                this.localDraft.rowValues[rowIndex] = Number(valueInput.value)
            }

            row.appendChild(valueInput)

            // Questions
            draft.categories.forEach((category, cIndex) => {
                const cell = document.createElement("div")
                cell.className = "board-draft-question-cell"

                const questionInput = document.createElement("textarea")
                questionInput.className = "board-draft-question-text"
                questionInput.placeholder = "Question"
                questionInput.value = category.questions[rowIndex].text

                questionInput.oninput = () => {
                    if (!this.localDraft) return
                    this.localDraft.categories[cIndex].questions[rowIndex].text = questionInput.value
                }

                const answerInput = document.createElement("textarea")
                answerInput.className = "board-draft-question-answer"
                answerInput.placeholder = "Answer (optional)"
                answerInput.value = category.questions[rowIndex].answer

                answerInput.oninput = () => {
                    if (!this.localDraft) return
                    this.localDraft.categories[cIndex].questions[rowIndex].answer = answerInput.value
                }

                cell.appendChild(questionInput)
                cell.appendChild(answerInput)
                row.appendChild(cell)
            })
            grid.appendChild(row)
        })

        return grid
    }

    /* ---------- Actions ---------- */

    private renderActions(): HTMLElement {
        const actions = document.createElement("div")
        actions.className = "edit-board-actions"

        const exportButton = document.createElement("button")
        exportButton.className = "draft-export-button"
        exportButton.textContent = "Export board"
        exportButton.onclick = () => {
            if (!this.localDraft) return
            this.onDraftChange(structuredClone(this.localDraft))
            this.onExportBoard()
        }
        actions.appendChild(exportButton)

        /* ---------- Import ---------- */

        const importInput = document.createElement("input")
        importInput.className = "draft-import-input"
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
                importInput.value = ""
            }
        }

        const importButton = document.createElement("button")
        importButton.className = "draft-import-button"
        importButton.textContent = "Import board"
        importButton.onclick = () => importInput.click()

        actions.appendChild(importButton)
        actions.appendChild(importInput)

        /* ---------- Submit ---------- */

        const submit = document.createElement("button")
        submit.className = "draft-submit-button"
        submit.textContent = "Submit board"
        submit.onclick = () => {
            if (!this.localDraft) return
            this.onDraftChange(structuredClone(this.localDraft))
            this.onSubmitBoard()
        }

        actions.appendChild(submit)

        return actions
    }
}

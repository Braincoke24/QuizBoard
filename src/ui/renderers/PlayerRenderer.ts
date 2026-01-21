// src/ui/renderers/PlayerRenderer.ts
import { GameUIState } from "../state/GameUIState.js"

/**
 * Renders the player UI and wires mouse interactions.
 */
export class PlayerRenderer {
    private readonly root: HTMLElement

    private readonly onSelectQuestion: (c: number, q: number) => void
    private readonly onBuzz: (playerId: string) => void
    private readonly onAnswer: (isCorrect: boolean) => void
    private readonly onPass: () => void

    constructor(
        root: HTMLElement,
        onSelectQuestion: (c: number, q: number) => void,
        onBuzz: (playerId: string) => void,
        onAnswer: (isCorrect: boolean) => void,
        onPass: () => void
    ) {
        this.root = root
        this.onSelectQuestion = onSelectQuestion
        this.onBuzz = onBuzz
        this.onAnswer = onAnswer
        this.onPass = onPass
    }

    public render(state: GameUIState): void {
        this.root.innerHTML = ""

        this.root.className = "player-view"

        this.renderHeader(state)
        this.renderScoreboard(state)
        this.renderBoard(state)
        this.renderControls(state)
    }

    private renderHeader(state: GameUIState): void {
        const header = document.createElement("div")

        const activePlayer = state.getTurnStartingPlayer()
        const turnState = state.getTurnState()

        header.className = "header"

        header.textContent = `Turn: ${activePlayer.name} — ${turnState}`
        this.root.appendChild(header)
    }

    private renderScoreboard(state: GameUIState): void {
        const scoreboard = document.createElement("div")
        scoreboard.className = "scoreboard"

        state.getPlayers().forEach((player) => {
            const row = document.createElement("div")
            row.className = "player-row"

            if (player.isActive) row.classList.add("active")
            if (player.isLockedOut) row.classList.add("locked")

            const name = document.createElement("div")
            name.className = "player-name"
            name.textContent = `${player.name}: ${player.score}`

            row.appendChild(name)

            // Buzzer directly under the player name
            row.appendChild(
                this.renderPlayerBuzzer(state, player.id)
            )

            scoreboard.appendChild(row)
        })

        this.root.appendChild(scoreboard)
    }

    private renderBoard(state: GameUIState): void {
        const container = document.createElement("div")
        container.className = "board-container"

        const board = this.renderBoardGrid(state)
        container.appendChild(board)

        if (state.getActiveQuestion() !== null) {
            container.classList.add("has-overlay")
            container.appendChild(this.renderActiveQuestionOverlay(state))
        }

        this.root.appendChild(container)
    }

    private renderBoardGrid(state: GameUIState): HTMLElement {
        const board = document.createElement("div")
        board.className = "board"

        const headerRow = document.createElement("div")
        headerRow.className = "board-header"

        state.getBoard().forEach((category) => {
            const header = document.createElement("div")
            header.textContent = category.name
            headerRow.appendChild(header)
        })

        board.appendChild(headerRow)

        const maxRows = Math.max(
            ...state.getBoard().map((c) => c.questions.length)
        )

        for (let q = 0; q < maxRows; q++) {
            const row = document.createElement("div")
            row.className = "board-row"

            state.getBoard().forEach((category, cIndex) => {
                const question = category.questions[q]
                const button = document.createElement("button")
                button.className = "question"

                if (!question) {
                    button.disabled = true
                    button.textContent = ""
                } else {
                    button.textContent = question.isAvailable
                        ? question.value.toString()
                        : "—"

                    button.disabled = !question.isAvailable
                    button.onclick = () => this.onSelectQuestion(cIndex, q)

                    if (!question.isAvailable) {
                        button.classList.add("used")
                    }
                }

                row.appendChild(button)
            })

            board.appendChild(row)
        }

        return board
    }

    private renderControls(state: GameUIState): void {
        const controls = document.createElement("div")
        controls.className = "controls"

        // Answer controls
        const correct = document.createElement("button")
        correct.textContent = "Correct"
        correct.disabled = !state.canAnswer()
        correct.onclick = () => this.onAnswer(true)

        const wrong = document.createElement("button")
        wrong.textContent = "Wrong"
        wrong.disabled = !state.canAnswer()
        wrong.onclick = () => this.onAnswer(false)

        const pass = document.createElement("button")
        pass.textContent = "Pass"
        pass.disabled = !state.canPass()
        pass.onclick = () => this.onPass()

        correct.className = "answer correct"
        wrong.className = "answer wrong"
        pass.className = "pass"

        controls.append(correct, wrong, pass)
        this.root.appendChild(controls)
    }

    private renderPlayerBuzzer(
        state: GameUIState,
        playerId: string
    ): HTMLElement {
        const button = document.createElement("button")
        button.className = "buzz-button"

        button.textContent = "Buzz"
        button.disabled = !state.canBuzz(playerId)
        button.onclick = () => this.onBuzz(playerId)

        return button
    }

    private renderActiveQuestionOverlay(state: GameUIState): HTMLElement {
        const overlay = document.createElement("div")
        overlay.className = "question-overlay"

        const question = state.getActiveQuestion()
        if (!question) return overlay

        const card = document.createElement("div")
        card.className = "question-card"

        const category = document.createElement("div")
        category.className = "question-category"
        category.textContent = question.categoryName

        const value = document.createElement("div")
        value.className = "question-value"
        value.textContent = question.value.toString()

        const text = document.createElement("div")
        text.className = "question-text"
        text.textContent = question.text

        card.append(category, value, text)
        overlay.appendChild(card)

        return overlay
    }
}

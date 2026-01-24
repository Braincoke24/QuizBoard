// src/ui/renderers/GameViewRenderer.ts
import { ActiveQuestionUIState } from "../state/GameUIState.js"
import { UIViewProfile } from "../state/UIViewProfile.js"
import { GameUISnapshot } from "../state/GameUISnapshot.js"

/**
 * Renders the player UI and wires mouse interactions.
 */
export class GameViewRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly profile: UIViewProfile,
        private readonly onSelectQuestion: (c: number, q: number) => void,
        private readonly onBuzz: (playerId: string) => void,
        private readonly onAnswer: (isCorrect: boolean) => void,
        private readonly onPass: () => void
    ) {}

    public render(snapshot: GameUISnapshot): void {
        this.root.innerHTML = ""

        this.root.className = "game-view"

        this.renderScoreboard(snapshot)
        this.renderBoard(snapshot)
    }

    private renderScoreboard(snapshot: GameUISnapshot): void {
        const scoreboard = document.createElement("div")
        scoreboard.className = "scoreboard"

        snapshot.players.forEach((player) => {
            const row = document.createElement("div")
            row.className = "player-row"

            if (player.isActive) row.classList.add("active")
            if (player.isLockedOut) row.classList.add("locked")

            const name = document.createElement("div")
            name.className = "player-name"
            name.textContent = `${player.name}: ${player.score}`

            row.append(name)

            // Buzzer directly under the player name
            if (this.profile.capabilities.canBuzz) {
                row.append(
                    this.renderBuzzer(snapshot, player.id)
                )
            }

            scoreboard.append(row)
        })

        this.root.append(scoreboard)
    }

    private renderBuzzer(snapshot: GameUISnapshot, playerId: string): HTMLElement {
        const button = document.createElement("button")
        button.className = "buzz-button"

        button.textContent = "Buzz"
        button.disabled = !snapshot.canBuzz.includes(playerId)
        button.onclick = () => this.onBuzz(playerId)

        return button
    }

    private renderBoard(snapshot: GameUISnapshot): void {
        const container = document.createElement("div")
        container.className = "board-container"

        const board = this.renderBoardGrid(snapshot)
        container.append(board)

        if (snapshot.activeQuestion !== null) {
            container.classList.add("has-overlay")
            container.append(this.renderActiveQuestionOverlay(snapshot))
        }

        this.root.append(container)
    }

    private renderBoardGrid(snapshot: GameUISnapshot): HTMLElement {
        const board = document.createElement("div")
        board.className = "board"

        const headerRow = document.createElement("div")
        headerRow.className = "board-header"

        snapshot.board.forEach((category) => {
            const header = document.createElement("div")
            header.textContent = category.name
            headerRow.append(header)
        })

        board.append(headerRow)

        const maxRows = Math.max(
            ...snapshot.board.map((c) => c.questions.length)
        )

        for (let q = 0; q < maxRows; q++) {
            const row = document.createElement("div")
            row.className = "board-row"

            snapshot.board.forEach((category, cIndex) => {
                const question = category.questions[q]
                const button = document.createElement("button")
                button.className = "question"

                if (!question) {
                    button.disabled = true
                    button.textContent = ""
                    button.classList.add("empty")
                } else {
                    button.textContent = question.value.toString()

                    button.disabled = !question.isAvailable || !this.profile.capabilities.canSelectQuestion
                    button.onclick = () => this.onSelectQuestion(cIndex, q)

                    if (!question.isAvailable) {
                        button.classList.add("used")
                    }
                }

                row.append(button)
            })

            board.append(row)
        }

        return board
    }

    private renderActiveQuestionOverlay(snapshot: GameUISnapshot): HTMLElement {
        const overlay = document.createElement("div")
        overlay.className = "question-overlay"

        const question = snapshot.activeQuestion
        if (!question) return overlay

        const card = this.renderQuestionCard(question)
        const controls = this.renderQuestionControls(snapshot)

        overlay.append(card)
        overlay.append(controls)

        return overlay
    }

    private renderQuestionCard(question: ActiveQuestionUIState): HTMLElement {
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

        if (this.profile.visibility.showCorrectAnswer) {
            const answer = document.createElement("div")
            answer.className = "question-answer"
            answer.textContent = question.answer

            card.append(answer)
        }

        return card
    }

    private renderQuestionControls(snapshot: GameUISnapshot): HTMLElement {
        const controls = document.createElement("div")
        controls.className = "question-controls"

        if (this.profile.capabilities.canJudgeAnswer) {
            const correct = document.createElement("button")
            correct.className = "answer correct"
            correct.textContent = "Correct"
            correct.disabled = !snapshot.canAnswer
            correct.onclick = () => this.onAnswer(true)
    
            const wrong = document.createElement("button")
            wrong.className = "answer wrong"
            wrong.textContent = "Wrong"
            wrong.disabled = !snapshot.canAnswer
            wrong.onclick = () => this.onAnswer(false)

            if (!snapshot.canAnswer) {
                correct.classList.add("hidden")
                wrong.classList.add("hidden")
            }

            controls.append(correct, wrong)
        }

        if (this.profile.capabilities.canPass) {
            const pass = document.createElement("button")
            pass.className = "pass"
            pass.textContent = "Pass"
            pass.disabled = !snapshot.canPass
            pass.onclick = () => this.onPass()

            if (snapshot.canAnswer) {
                pass.classList.add("hidden")
            }

            controls.append(pass)
        }

        return controls
    }
}

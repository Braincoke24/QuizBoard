// src/ui/game/GameViewRenderer.ts
import { ActiveQuestionUIState } from "./state/GameUIState.js"
import { UIViewProfile } from "../shared/view/UIViewProfile.js"
import { GameUISnapshot } from "./state/GameUISnapshot.js"
import { TurnState } from "../../game/turn/TurnState.js"

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
        private readonly onPass: () => void,
        private readonly onContinue: () => void
    ) {}

    public render(snapshot: GameUISnapshot): void {
        this.root.innerHTML = ""

        this.root.className = "app-content-root game-running"

        this.renderScoreboard(snapshot)
        this.renderBoard(snapshot)
    }

    private renderScoreboard(snapshot: GameUISnapshot): void {
        const scoreboard = document.createElement("div")
        scoreboard.className = "player-list"

        snapshot.players.forEach((player) => {
            const cell = document.createElement("div")
            cell.className = "player-cell"

            if (player.isActive) cell.classList.add("active")
            if (player.isLockedOut) cell.classList.add("locked")

            const name = document.createElement("div")
            name.className = "player-name"
            name.textContent = player.name

            const score = document.createElement("div")
            score.className = "player-score"
            score.textContent = player.score.toString()

            cell.append(name, score)

            // Buzzer directly under the player name
            if (this.profile.capabilities.canBuzz) {
                cell.append(
                    this.renderBuzzer(snapshot, player.id)
                )
            }

            scoreboard.append(cell)
        })

        this.root.append(scoreboard)
    }

    private renderBuzzer(snapshot: GameUISnapshot, playerId: string): HTMLElement {
        const button = document.createElement("button")
        button.className = "buzz-button action-button accent"

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
                button.className = "question-cell"

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
        overlay.className = "active-question-overlay"

        const question = snapshot.activeQuestion
        if (!question) return overlay

        const card = this.renderQuestionCard(question, snapshot)
        const controls = this.renderQuestionControls(snapshot)

        overlay.append(card)
        overlay.append(controls)

        return overlay
    }

    private renderQuestionCard(question: ActiveQuestionUIState, snapshot: GameUISnapshot): HTMLElement {
        const card = document.createElement("div")
        card.className = "active-question"

        const category = document.createElement("div")
        category.className = "active-question-category"
        category.textContent = question.categoryName

        const value = document.createElement("div")
        value.className = "active-question-value"
        value.textContent = question.value.toString()

        const text = document.createElement("div")
        text.className = "active-question-text"
        text.textContent = question.text

        card.append(category, value, text)

        if (this.profile.visibility.showCorrectAnswer || snapshot.turnState === TurnState.RESOLVING) {
            const answer = document.createElement("div")
            answer.className = "active-question-answer"
            answer.textContent = question.answer

            card.append(answer)
        }

        return card
    }

    private renderQuestionControls(snapshot: GameUISnapshot): HTMLElement {
        const controls = document.createElement("div")
        controls.className = "active-question-controls"

        if (this.profile.capabilities.canJudgeAnswer) {
            const correct = document.createElement("button")
            correct.className = "correct action-button accent"
            correct.textContent = "Correct"
            correct.disabled = !snapshot.canAnswer
            correct.onclick = () => this.onAnswer(true)
    
            const wrong = document.createElement("button")
            wrong.className = "wrong action-button accent"
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
            pass.className = "pass action-button accent"
            pass.textContent = "Pass"
            pass.disabled = !snapshot.canPass
            pass.onclick = () => this.onPass()

            if (snapshot.canAnswer) {
                pass.classList.add("hidden")
            }

            controls.append(pass)
        }

        if (this.profile.capabilities.canContinue) {
            const continueGame = document.createElement("button")
            continueGame.className = "continue action-button accent"
            continueGame.textContent = "Continue"
            continueGame.disabled = !snapshot.canContinue
            continueGame.onclick = () => this.onContinue()

            if (!snapshot.canContinue) {
                continueGame.classList.add("hidden")
            }

            controls.append(continueGame)
        }

        return controls
    }
}

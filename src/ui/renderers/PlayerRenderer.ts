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

        this.renderBoard(state)
        this.renderControls(state)
    }

    private renderBoard(state: GameUIState): void {
        const board = document.createElement("div")

        state.getBoard().forEach((category, cIndex) => {
            const row = document.createElement("div")

            category.questions.forEach((question, qIndex) => {
                const button = document.createElement("button")
                button.textContent = question.isAvailable
                    ? question.value.toString()
                    : "—"

                button.disabled = !question.isAvailable
                button.onclick = () => this.onSelectQuestion(cIndex, qIndex)

                row.appendChild(button)
            })

            board.appendChild(row)
        })

        this.root.appendChild(board)
    }

    private renderControls(state: GameUIState): void {
        const controls = document.createElement("div")

        const buzz = document.createElement("button")
        buzz.textContent = "Buzz"
        buzz.onclick = () => this.onBuzz("a")

        const correct = document.createElement("button")
        correct.textContent = "Correct"
        correct.onclick = () => this.onAnswer(true)

        const wrong = document.createElement("button")
        wrong.textContent = "Wrong"
        wrong.onclick = () => this.onAnswer(false)

        const pass = document.createElement("button")
        pass.textContent = "Pass"
        pass.onclick = () => this.onPass()

        controls.append(buzz, correct, wrong, pass)
        this.root.appendChild(controls)
    }
}

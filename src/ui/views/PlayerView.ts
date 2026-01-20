// src/ui/views/PlayerView.ts
import { GamePort } from "../ports/GamePort.js"
import { PlayerRenderer } from "../renderers/PlayerRenderer.js"

/**
 * Player-facing view using mouse interactions only.
 */
export class PlayerView {
    private readonly port: GamePort
    private readonly renderer: PlayerRenderer

    constructor(port: GamePort, root: HTMLElement) {
        this.port = port
        this.renderer = new PlayerRenderer(
            root,
            this.handleSelectQuestion.bind(this),
            this.handleBuzz.bind(this),
            this.handleAnswer.bind(this),
            this.handlePass.bind(this)
        )

        this.render()
    }

    public render(): void {
        const uiState = this.port.getUIState()
        this.renderer.render(uiState)
    }

    private handleSelectQuestion(categoryIndex: number, questionIndex: number): void {
        this.port.selectQuestion(categoryIndex, questionIndex)
        this.render()
    }

    private handleBuzz(playerId: string): void {
        this.port.buzz(playerId)
        this.render()
    }

    private handleAnswer(isCorrect: boolean): void {
        this.port.answer(isCorrect)
        this.render()
    }

    private handlePass(): void {
        this.port.pass()
        this.render()
    }
}

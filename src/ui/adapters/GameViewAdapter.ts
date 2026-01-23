// src/ui/adapters/GameViewAdapter.ts
import { GamePort } from "../ports/GamePort.js"
import { GameViewRenderer } from "../renderers/GameViewRenderer.js"
import { UIViewProfile } from "../state/UIViewProfile.js"

export class GameViewAdapter {
    private readonly port: GamePort
    private readonly renderer: GameViewRenderer

    constructor(port: GamePort, profile: UIViewProfile, root: HTMLElement) {
        this.port = port
        this.renderer = new GameViewRenderer(
            root,
            profile,
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

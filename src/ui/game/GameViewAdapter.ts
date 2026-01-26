// src/ui/adapters/GameViewAdapter.ts
import { GamePort } from "./ports/GamePort.js"
import { GameViewRenderer } from "./GameViewRenderer.js"
import { UIViewProfile } from "../shared/view/UIViewProfile.js"
import { GameUISnapshot } from "./state/GameUISnapshot.js"

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

        this.port.subscribe(this.handleSnapshot.bind(this))
    }

    private handleSnapshot(snapshot: GameUISnapshot): void {
        this.renderer.render(snapshot)
    }

    private handleSelectQuestion(categoryIndex: number, questionIndex: number): void {
        this.port.selectQuestion(categoryIndex, questionIndex)
    }

    private handleBuzz(playerId: string): void {
        this.port.buzz(playerId)
    }

    private handleAnswer(isCorrect: boolean): void {
        this.port.answer(isCorrect)
    }

    private handlePass(): void {
        this.port.pass()
    }
}

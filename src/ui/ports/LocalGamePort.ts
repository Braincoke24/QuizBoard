// src/ui/ports/LocalGamePort.ts
import { GameController } from "../controllers/GameController.js"
import { GamePort } from "./GamePort.js"

export class LocalGamePort implements GamePort {
    private controller: GameController

    constructor(controller: GameController) {
        this.controller = controller
    }

    getUIState() {
        return this.controller.getUIState()
    }

    selectQuestion(categoryIndex: number, questionIndex: number) {
        this.controller.selectQuestion(categoryIndex, questionIndex)
    }

    answer(isCorrect: boolean) {
        this.controller.answer(isCorrect)
    }

    buzz(playerId: string) {
        this.controller.buzz(playerId)
    }

    pass() {
        this.controller.pass()
    }
}

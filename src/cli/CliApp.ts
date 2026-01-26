// src/cli/CliApp.ts
import { GameUIController } from "../ui/game/GameUIController.js"
import { CliRenderer } from "./CliRenderer.js"
import { CliInput } from "./CliInput.js"
import { TurnState } from "../game/turn/TurnState.js"

/**
 * Main CLI application loop.
 */
export class CliApp {
    private readonly controller: GameUIController
    private readonly renderer = new CliRenderer()
    private readonly input = new CliInput()

    public constructor(controller: GameUIController) {
        this.controller = controller
    }

    /**
     * Starts the game loop.
     */
    public async run(): Promise<void> {
        while (true) {
            const state = this.controller.getUIState()

            console.clear()
            console.log(this.renderer.render(state))

            const line = await this.input.readLine()
            this.handleCommand(line)
        }
    }

    private handleCommand(line: string): void {
        const state = this.controller.getUIState()
        const parts = line.split(" ")

        try {
            switch (state.getTurnState()) {
                case TurnState.SELECTING: {
                    const c = Number(parts[0])
                    const q = Number(parts[1])
                    this.controller.selectQuestion(c, q)
                    break
                }

                case TurnState.ANSWERING: {
                    if (parts[0] === "correct") {
                        this.controller.answer(true)
                    } else if (parts[0] === "wrong") {
                        this.controller.answer(false)
                    }
                    break
                }

                case TurnState.BUZZING: {
                    if (parts[0] === "pass") {
                        this.controller.pass()
                    } else if (parts[0] === "buzz") {
                        const index = Number(parts[1])
                        const player = state.getPlayers()[index]
                        this.controller.buzz(player.id)
                    }
                    break
                }
            }
        } catch (e) {
            console.log((e as Error).message)
        }
    }
}

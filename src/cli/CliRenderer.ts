// src/cli/CliRenderer.ts
import { GameUIState } from "../ui/GameUIState.js"
import { TurnState } from "../game/TurnState.js"

/**
 * Responsible for converting the UI state into printable text.
 */
export class CliRenderer {

    /**
     * Renders the entire screen.
     */
    public render(state: GameUIState): string {
        return [
            this.renderHeader(state),
            this.renderScoreboard(state),
            this.renderBoard(state),
            this.renderActiveQuestion(state),
            this.renderPrompt(state)
        ].join("\n\n")
    }

    private renderHeader(state: GameUIState): string {
        const player = state.getActivePlayer().name
        const phase = state.getTurnState()

        return `Active player: ${player} | Phase: ${phase}`
    }

    private renderScoreboard(state: GameUIState): string {
        const lines: string[] = ["Scoreboard"]

        for (const player of state.getPlayers()) {
            let name = player.name

            if (state.isPlayerActive(player)) {
                name = `[${name}]`
            }

            if (state.isPlayerLockedOut(player)) {
                name = `${name} (x)`
            }

            lines.push(`${name}: ${player.score}`)
        }

        return lines.join("\n")
    }


    private renderBoard(state: GameUIState): string {
        const lines: string[] = []

        for (const category of state.getBoard()) {
            const row = category.questions
                .map((q) => q.isAvailable ? String(q.value).padStart(4) : "  XX")
                .join(" ")

            lines.push(`${category.name}: ${row}`)
        }

        return lines.join("\n")
    }

    private renderActiveQuestion(state: GameUIState): string {
        const q = state.getActiveQuestion()
        if (!q) return ""

        return `Question (${q.value}): ${q.text}`
    }

    private renderPrompt(state: GameUIState): string {
        switch (state.getTurnState()) {
            case TurnState.SELECTING:
                return "Select a question: categoryIndex questionIndex"
            case TurnState.ANSWERING:
                return "Answer: correct | wrong"
            case TurnState.BUZZING:
                return "Buzz: buzz <playerIndex> | pass"
            default:
                return ""
        }
    }
}

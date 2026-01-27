// src/ui/preGameSetup/PreGameSetupRenderer.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { PlayerConfig, PreGameSetup } from "./PreGameSetupState.js"
import { GameRulePreset } from "../../game/GameRulePresets.js"

export class PreGameSetupRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly presets: readonly GameRulePreset[],
        private readonly onAddPlayer: (name: string) => void,
        private readonly onRemovePlayer: (id: string) => void,
        private readonly onSelectRule: (ruleId: string) => void,
        private readonly onUpdateMultiplier: (
            key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
            value: number
        ) => void,
        private readonly onStartGame: () => void
    ) {}

    public render(setup: PreGameSetup): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "pre-game-setup"

        container.appendChild(this.renderPlayers(setup.players))
        container.appendChild(this.renderBoardPreview(setup.board))
        container.appendChild(this.renderGameRules(setup))
        container.appendChild(this.renderGameOptions())

        this.root.appendChild(container)
    }

    /* ---------- Players ---------- */

    private renderPlayers(players: readonly PlayerConfig[]): HTMLElement {
        const container = document.createElement("div")
        container.className = "players-container"

        const title = document.createElement("h3")
        title.textContent = "Players"
        container.appendChild(title)

        container.appendChild(this.renderAddPlayer())
        container.appendChild(this.renderPlayerList(players))

        return container
    }

    private renderAddPlayer(): HTMLElement {
        const container = document.createElement("div")
        container.className = "add-player-container"

        const input = document.createElement("input")
        input.type = "text"
        input.placeholder = "Player name"

        const button = document.createElement("button")
        button.textContent = "Add player"

        button.onclick = () => {
            const name = input.value.trim()
            if (name.length === 0) return

            this.onAddPlayer(name)
            input.value = ""
        }

        container.append(input, button)
        return container
    }

    private renderPlayerList(players: readonly PlayerConfig[]): HTMLElement {
        const list = document.createElement("div")
        list.className = "player-list"

        players.forEach((player) => {
            list.appendChild(this.renderPlayerRow(player))
        })

        return list
    }

    private renderPlayerRow(player: PlayerConfig): HTMLElement {
        const row = document.createElement("div")
        row.className = "player-row"

        const name = document.createElement("span")
        name.textContent = player.name

        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Delete"
        deleteButton.onclick = () => {
            this.onRemovePlayer(player.id)
        }

        row.append(name, deleteButton)
        return row
    }

    /* ---------- Board Preview ---------- */

    private renderBoardPreview(draft: BoardDraft): HTMLElement {
        const container = document.createElement("div")
        container.className = "board-preview-container"

        const board = document.createElement("div")
        board.className = "board-preview"

        const headerRow = document.createElement("div")
        headerRow.className = "board-preview-header"

        draft.categories.forEach((category) => {
            const header = document.createElement("div")
            header.textContent = category.name
            headerRow.append(header)
        })

        board.append(headerRow)

        draft.rowValues.forEach((value, rowIndex) => {
            const row = document.createElement("div")
            row.className = "board-preview-row"

            for (let i = 0; i < draft.categories.length; i++) {
                const question = draft.categories[i].questions[rowIndex]
                const cell = document.createElement("div")
                cell.className = "board-preview-question-cell"
                cell.textContent = question ? value.toString() : ""
                row.append(cell)
            }

            board.append(row)
        })

        container.append(board)
        return container
    }

    /* ---------- Game Rules ---------- */

    private renderGameRules(setup: PreGameSetup): HTMLElement {
        const container = document.createElement("div")
        container.className = "game-rules-container"

        container.appendChild(this.renderRuleTabs(setup))
        container.appendChild(this.renderRuleDetails(setup))

        return container
    }

    private renderRuleTabs(setup: PreGameSetup): HTMLElement {
        const tabs = document.createElement("div")
        tabs.className = "rule-tabs"

        this.presets.forEach((preset) => {
            const button = document.createElement("button")
            button.textContent = preset.label

            if (preset.id === setup.selectedRuleId) {
                button.classList.add("active")
            }

            button.onclick = () => this.onSelectRule(preset.id)
            tabs.appendChild(button)
        })

        return tabs
    }

    private renderRuleDetails(setup: PreGameSetup): HTMLElement {
        const preset = this.presets.find(
            (p) => p.id === setup.selectedRuleId
        )!

        const rules = preset.editable
            ? setup.customMultipliers
            : preset.rules

        const container = document.createElement("div")
        container.className = "rule-details"

        container.appendChild(
            this.renderMultiplier("First wrong", "firstWrongMultiplier", rules.firstWrongMultiplier, preset.editable)
        )
        container.appendChild(
            this.renderMultiplier("Buzz correct", "buzzCorrectMultiplier", rules.buzzCorrectMultiplier, preset.editable)
        )
        container.appendChild(
            this.renderMultiplier("Buzz wrong", "buzzWrongMultiplier", rules.buzzWrongMultiplier, preset.editable)
        )

        return container
    }

    private renderMultiplier(
        label: string,
        key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
        value: number,
        editable: boolean
    ): HTMLElement {
        const row = document.createElement("div")
        row.className = "multiplier-row"

        const name = document.createElement("span")
        name.textContent = label
        row.appendChild(name)

        if (!editable) {
            const text = document.createElement("span")
            text.textContent = value.toString()
            row.appendChild(text)
            return row
        }

        const input = document.createElement("input")
        input.type = "number"
        input.min = "0"
        input.value = value.toString()

        input.onchange = () => {
            this.onUpdateMultiplier(key, Number(input.value))
        }

        row.appendChild(input)
        return row
    }

    /* ---------- Actions ---------- */

    private renderGameOptions(): HTMLElement {
        const container = document.createElement("div")
        container.className = "game-options-container"

        const button = document.createElement("button")
        button.textContent = "Start"
        button.onclick = this.onStartGame

        container.appendChild(button)
        return container
    }
}

// src/ui/preGameSetup/PreGameSetupRenderer.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { PlayerConfig, PreGameSetup } from "./PreGameSetupState.js"
import { GameRulePreset } from "../../game/GameRulePresets.js"

type WindowMode = "single" | "dual" | "keep-current"

export class PreGameSetupRenderer {
    private selectedWindowMode: WindowMode = "keep-current"
    private lastSetup: PreGameSetup | null = null

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
        private readonly onStartGame: (mode: WindowMode) => void
    ) {}

    public render(setup: PreGameSetup): void {
        this.lastSetup = setup
        this.renderLast()
    }

    private renderLast(): void {
        if (!this.lastSetup) return

        this.root.innerHTML = ""

        this.root.classList.add("pre-game-setup")

        this.root.appendChild(this.renderPlayers(this.lastSetup.players))
        this.root.appendChild(this.renderBoardPreview(this.lastSetup.board))
        this.root.appendChild(this.renderGameOptions(this.lastSetup))
    }

    /* ---------- Players ---------- */

    private renderPlayers(players: readonly PlayerConfig[]): HTMLElement {
        const container = document.createElement("div")
        container.className = "player-list"

        container.appendChild(this.renderPlayerHeader(players))
        container.appendChild(this.renderAddPlayer())

        players.forEach((player) => {
            container.appendChild(this.renderPlayerRow(player))
        })

        return container
    }

    private renderPlayerHeader(players: readonly PlayerConfig[]): HTMLElement {
        const container = document.createElement("div")
        container.className = "player-header"

        const title = document.createElement("div")
        title.className = "player-title"
        title.textContent = "Players"

        const counter = document.createElement("div")
        counter.className = "player-counter"
        counter.textContent = `${players.length}/6`

        container.append(title,counter)

        return container
    }

    private renderAddPlayer(): HTMLElement {
        const cell = document.createElement("div")
        cell.className = "player-cell"

        const input = document.createElement("input")
        input.type = "text"
        input.placeholder = "Player name"
        input.className = "player-name"

        const addButton = document.createElement("button")
        addButton.className = "player-add"
        addButton.textContent = "Add"

        addButton.onclick = () => {
            const name = input.value.trim()
            if (name.length === 0) return

            this.onAddPlayer(name)
            input.value = ""
        }

        cell.append(input, addButton)
        return cell
    }

    private renderPlayerRow(player: PlayerConfig): HTMLElement {
        const cell = document.createElement("div")
        cell.className = "player-cell"

        const name = document.createElement("div")
        name.className = "player-name"
        name.textContent = player.name

        const deleteButton = document.createElement("button")
        deleteButton.className = "player-delete"
        deleteButton.textContent = "Delete"
        deleteButton.onclick = () => {
            this.onRemovePlayer(player.id)
        }

        cell.append(name, deleteButton)
        return cell
    }

    /* ---------- Board Preview ---------- */

    private renderBoardPreview(draft: BoardDraft): HTMLElement {
        const container = document.createElement("div")
        container.className = "board-container"

        const board = document.createElement("div")
        board.className = "board"

        const headerRow = document.createElement("div")
        headerRow.className = "board-header"

        draft.categories.forEach((category) => {
            const header = document.createElement("div")
            header.textContent = category.name
            headerRow.append(header)
        })

        board.append(headerRow)

        draft.rowValues.forEach((value, rowIndex) => {
            const row = document.createElement("div")
            row.className = "board-row"

            for (let i = 0; i < draft.categories.length; i++) {
                const question = draft.categories[i].questions[rowIndex]
                const cell = document.createElement("div")
                cell.className = "question-cell"
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

    /* ---------- Window Mode ---------- */

    private renderWindowModeSelector(): HTMLElement {
        const container = document.createElement("div")
        container.className = "window-mode-selector"

        container.append(
            this.createWindowModeButton("Single window", "single"),
            this.createWindowModeButton("Dual window", "dual"),
            this.createWindowModeButton("Keep current", "keep-current")
        )

        return container
    }

    private createWindowModeButton(
        label: string,
        mode: WindowMode
    ): HTMLButtonElement {
        const button = document.createElement("button")
        button.textContent = label

        if (this.selectedWindowMode === mode) {
            button.classList.add("active")
        }

        button.onclick = () => {
            this.selectedWindowMode = mode
            this.renderLast()
        }

        return button
    }

    /* ---------- Actions ---------- */

    private renderGameOptions(setup: PreGameSetup): HTMLElement {
        const container = document.createElement("div")
        container.className = "game-options-container"

        const rules = this.renderGameRules(setup)
        const windowMode = this.renderWindowModeSelector()

        const startButton = document.createElement("button")
        startButton.textContent = "Start"
        startButton.onclick = () => {
            this.onStartGame(this.selectedWindowMode)
        }

        container.append(rules, windowMode, startButton)
        return container
    }
}

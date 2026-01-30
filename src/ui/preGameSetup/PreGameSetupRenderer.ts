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
        if (players.length < 6) container.appendChild(this.renderAddPlayer())

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
        const MAX_NAME_LENGTH = 16

        const cell = document.createElement("form")
        cell.className = "player-cell"

        const input = document.createElement("input")
        input.type = "text"
        input.placeholder = "Player name"
        input.className = "player-name"
        input.maxLength = MAX_NAME_LENGTH

        const addButton = document.createElement("button")
        addButton.className = "player-add"
        addButton.type = "submit"
        addButton.textContent = "Add"
        addButton.disabled = true

        const updateButtonState = (): void => {
            const name = input.value.trim()
            addButton.disabled = name.length === 0
        }

        input.addEventListener("input", updateButtonState)

        cell.addEventListener("submit", (event) => {
            event.preventDefault()

            const name = input.value.trim()
            if (name.length === 0) return

            this.onAddPlayer(name)

            input.value = ""
            updateButtonState()
        })

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
        container.className = "game-rules"

        const title = document.createElement("div")
        title.className = "game-rules-title"
        title.textContent = "Multipliers"

        container.appendChild(title)

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
            this.renderMultiplier("Initial wrong", "Applied when the first player answers incorrectly", "firstWrongMultiplier", rules.firstWrongMultiplier, preset.editable)
        )
        container.appendChild(
            this.renderMultiplier("Buzzed correct", "Applied when a buzzing player answers correctly", "buzzCorrectMultiplier", rules.buzzCorrectMultiplier, preset.editable)
        )
        container.appendChild(
            this.renderMultiplier("Buzzed wrong", "Applied when a buzzing player answers incorrectly", "buzzWrongMultiplier", rules.buzzWrongMultiplier, preset.editable)
        )

        return container
    }

    private renderMultiplier(
        label: string,
        tooltip: string,
        key: "firstWrongMultiplier" | "buzzCorrectMultiplier" | "buzzWrongMultiplier",
        value: number,
        editable: boolean
    ): HTMLElement {
        const row = document.createElement("div")
        row.className = "multiplier-row"

        const name = document.createElement("span")
        name.className = "multiplier-label"
        name.textContent = label

        const icon = document.createElement("span")
        icon.className = "info-icon"
        icon.dataset.tooltip = tooltip
        icon.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 15 15" aria-hidden="true">
                <path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                    fill="currentColor" />
            </svg>
        `

        name.appendChild(icon)

        row.appendChild(name)

        if (!editable) {
            const text = document.createElement("span")
            text.className = "multiplier-value"
            text.textContent = value.toString()
            row.appendChild(text)
            return row
        }

        const input = document.createElement("input")
        input.className = "multiplier-value"
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
        container.className = "game-options"

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

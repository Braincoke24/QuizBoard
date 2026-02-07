// src/ui/preGameSetup/PreGameSetupRenderer.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js"
import { BuzzerMode, PlayerConfig, PreGameSetup } from "./PreGameSetupState.js"
import { GameRulePreset } from "../../game/GameRulePresets.js"
import { INFO_ICON_SVG } from "../shared/icons.js"

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
        private readonly onSetBuzzerMode: (mode: "mouse-only" | "mouse-and-keyboard") => void,
        private readonly onStartGame: (mode: WindowMode) => void
    ) {}

    public render(setup: PreGameSetup): void {
        this.lastSetup = setup
        this.renderLast()
    }

    private renderLast(): void {
        if (!this.lastSetup) return

        this.root.innerHTML = ""

        this.root.className = "app-content-root pre-game-setup"

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
        addButton.className = "player-add action-button accent"
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
        deleteButton.className = "player-delete action-button warning"
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
                const cell = document.createElement("button")
                cell.disabled = true
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
                button.classList.add("selected")
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
        icon.innerHTML = INFO_ICON_SVG

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
        container.className = "window-mode"

        const title = document.createElement("div")
        title.className = "window-mode-title"
        title.textContent = "Window mode"

        container.appendChild(title)

        container.append(
            this.createWindowModeCard("Single", "One shared screen", "Players and gamemaster share one display. Answers are hidden until the question is answered or skipped.", "single"),
            this.createWindowModeCard("Dual", "Separate windows", "Opens a second window for display only (projector / second screen). The game can only be controlled from the gamemaster window.", "dual"),
            this.createWindowModeCard("Current", "Use existing setup", "Use this if you already have two windows open and configured.", "keep-current")
        )

        return container
    }

    private createWindowModeCard(
        name: string,
        shortDesc: string,
        longDesc: string,
        mode: WindowMode
    ): HTMLElement {
        const container = document.createElement("div")
        container.className = "window-mode-container"

        const button = document.createElement("button")
        button.className = "window-mode-button action-button"
        button.textContent = name

        const infoIcon = document.createElement("span")
        infoIcon.className = "info-icon"
        infoIcon.dataset.tooltip = longDesc
        infoIcon.innerHTML = INFO_ICON_SVG

        const desc = document.createElement("div")
        desc.className = "window-mode-desc"
        desc.textContent = shortDesc

        button.onclick = () => {
            this.selectedWindowMode = mode
            this.renderLast()
        }

        if (this.selectedWindowMode === mode) {
            button.classList.add("selected")
        }

        container.append(button,desc,infoIcon)

        return container
    }

    /* ---------- Actions ---------- */

    private renderBuzzerModeSelector(setup: PreGameSetup): HTMLElement {
        const container = document.createElement("div")
        container.className = "buzzer-mode"

        const title = document.createElement("div")
        title.className = "buzzer-mode-title"
        title.textContent = "Buzzer mode"

        const buttonContainer = document.createElement("div")
        buttonContainer.className = "buzzer-mode-container"
        
        buttonContainer.appendChild(this.renderBuzzerModeButton(setup,"mouse-only","Mouse"))
        buttonContainer.appendChild(this.renderBuzzerModeButton(setup,"mouse-and-keyboard","Keyboard"))
        
        container.append(title, buttonContainer)

        return container
    }

    private renderBuzzerModeButton(setup: PreGameSetup, mode: BuzzerMode, text: string): HTMLButtonElement {
        const button = document.createElement("button")
        button.className = "action-button"
        button.textContent = text
        button.onclick = () => this.onSetBuzzerMode(mode)

        if (setup.buzzerMode === mode) {
            button.classList.add("selected")
        }

        return button
    }

    private renderGameOptions(setup: PreGameSetup): HTMLElement {
        const container = document.createElement("div")
        container.className = "game-options"

        const rules = this.renderGameRules(setup)
        const buzzerMode = this.renderBuzzerModeSelector(setup)
        const windowMode = this.renderWindowModeSelector()

        const startContainer = document.createElement("div")
        startContainer.className = "game-start-container"

        const startButton = document.createElement("button")
        startButton.className = "game-start-button action-button accent"
        startButton.textContent = "Start game"
        startButton.onclick = () => {
            this.onStartGame(this.selectedWindowMode)
        }
        startButton.disabled = (setup.players.length === 0)

        startContainer.appendChild(startButton)

        container.append(rules, buzzerMode, windowMode, startContainer)
        return container
    }
}

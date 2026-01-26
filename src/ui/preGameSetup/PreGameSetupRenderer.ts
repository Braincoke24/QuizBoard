// src/ui/preGameSetup/PreGameSetupRenderer.ts
import { BoardDraft } from "../editBoard/BoardDraftState.js";
import { Player } from "./PreGameSetupState.js";

export class PreGameSetupRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly onAddPlayer: (name: string) => void,
        private readonly onRemovePlayer: (id: string) => void
    ) {}

    public render(draft: BoardDraft, players: readonly Player[]): void {
        this.root.innerHTML = ""

        const container = document.createElement("div")
        container.className = "pre-game-setup"

        container.appendChild(this.renderPlayers(players))
        container.appendChild(this.renderBoardPreview(draft))

        this.root.appendChild(container)
    }

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

                if (!question) {
                    cell.textContent = ""
                    cell.classList.add("empty")
                } else {
                    cell.textContent = value.toString()
                }

                row.append(cell)
            }

            board.append(row)
        })

        container.append(board)

        return container
    }

    private renderPlayers(players: readonly Player[]): HTMLElement {
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

        button.addEventListener("click", () => {
            const name = input.value.trim()
            if (name.length === 0) {
                return
            }

            this.onAddPlayer(name)
            input.value = ""
        })

        container.append(input, button)
        return container
    }

    private renderPlayerList(players: readonly Player[]): HTMLElement {
        const list = document.createElement("div")
        list.className = "player-list"

        players.forEach((player) => {
            list.appendChild(this.renderPlayerRow(player))
        })

        return list
    }

    private renderPlayerRow(player: Player): HTMLElement {
        const row = document.createElement("div")
        row.className = "player-row"

        const name = document.createElement("span")
        name.textContent = player.name

        const deleteButton = document.createElement("button")
        deleteButton.textContent = "Delete"
        deleteButton.addEventListener("click", () => {
            this.onRemovePlayer(player.id)
        })

        row.append(name, deleteButton)
        return row
    }
}

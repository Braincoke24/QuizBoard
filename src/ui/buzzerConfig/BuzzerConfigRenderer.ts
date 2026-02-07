// src/ui/buzzerConfig/BuzzerConfigRenderer.ts
import { AppSnapshot } from "../../app/AppSnapshot.js"
import { BuzzerConfigSnapshot } from "./BuzzerConfigState.js"

export class BuzzerConfigRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly onSkip: () => void
    ) {}

    public render(snapshot: BuzzerConfigSnapshot): void {
        this.root.innerHTML = ""
        this.root.className = "app-content-root buzzer-config"

        const title = document.createElement("div")
        title.className = "buzzer-config-title"
        title.textContent = snapshot.done
            ? "Buzzer configuration complete"
            : `Press a key for: ${snapshot.players[snapshot.currentIndex].name}`

        this.root.appendChild(title)
        this.root.appendChild(this.renderPlayerList(snapshot))
        this.root.appendChild(this.renderActions(snapshot))
    }

    private renderPlayerList(snapshot: BuzzerConfigSnapshot): HTMLElement {
        const list = document.createElement("div")
        list.className = "buzzer-config-player-list"

        snapshot.players.forEach((player, index) => {
            const row = document.createElement("div")
            row.className = "buzzer-config-player-row"

            if (index === snapshot.currentIndex && !snapshot.done) {
                row.classList.add("active")
            }

            const name = document.createElement("div")
            name.className = "buzzer-config-player-name"
            name.textContent = player.name

            const key = document.createElement("div")
            key.className = "buzzer-config-key"
            key.textContent = snapshot.assignedKeys[player.id] ?? "—"

            row.append(name, key)
            list.appendChild(row)
        })

        return list
    }

    private renderActions(snapshot: BuzzerConfigSnapshot): HTMLElement {
        const actions = document.createElement("div")
        actions.className = "buzzer-config-actions"

        if (!snapshot.done) {
            const skip = document.createElement("button")
            skip.className = "action-button accent"
            skip.textContent = "Skip"
            skip.onclick = () => this.onSkip()
    
            actions.appendChild(skip)
        }

        return actions
    }
}

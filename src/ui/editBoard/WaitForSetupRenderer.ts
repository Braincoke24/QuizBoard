// src/ui/landing/renderers/WaitForSetupRenderer.ts

import { PlayerUIState } from "../game/state/GameUIState.js";

export class WaitForSetupRenderer {
    private readonly FIGURE_SPACE = "\u2007"

    constructor(
        private readonly root: HTMLElement
    ) {}

    public render(players?: readonly PlayerUIState[]): void {
        this.root.innerHTML = ""
        
        this.root.className = "app-content-root wait-for-setup"

        const waitMessage = document.createElement("div")
        waitMessage.className = "wait-for-setup-message"
        waitMessage.textContent = "Waiting for gamemaster to setup the game..."

        this.root.appendChild(waitMessage)

        if (players) {
            this.root.appendChild(this.renderScoreboard(players))
        }
    }
    
    /* ---------- Scoreboard ---------- */

    private renderScoreboard(players: readonly PlayerUIState[]): HTMLElement {
        const scoreboard = document.createElement("div")
        scoreboard.className = "scoreboard"

        const label = document.createElement("div")
        label.className = "scoreboard-label"
        label.textContent = "Results"

        scoreboard.append(label)
        
        const sortedPlayers: PlayerUIState[] = []
        players.forEach((p) => sortedPlayers.push(Object.assign({}, p)))
        
        // sorts players in ascending order according to score
        const compareFn = (a: PlayerUIState, b: PlayerUIState): number => b.score - a.score
        sortedPlayers.sort(compareFn)

        sortedPlayers.forEach((p, i) => {
            const playerContainer = document.createElement("div")
            playerContainer.className = "scoreboard-player-cell"

            const rank = document.createElement("div")
            rank.className = "scoreboard-player-rank"
            rank.textContent = (i + 1).toString()
            switch (i + 1) {
                case 1:
                    rank.classList.add("rank-1")
                    break;

                case 2:
                    rank.classList.add("rank-2")
                    break;

                case 3:
                    rank.classList.add("rank-3")
                    break;
            
                default:
                    break;
            }

            const name = document.createElement("div")
            name.className = "scoreboard-player-name"
            name.textContent = p.name

            const score = document.createElement("div")
            score.className = "scoreboard-player-score"
            score.textContent = this.scoreToAlignedString(p.score)

            playerContainer.append(rank,name,score)

            scoreboard.append(playerContainer)
        })

        return scoreboard
    }

    private scoreToAlignedString(score: number, l: number = 5): string {
        const scoreLength = Math.max(Math.floor(Math.log10(Math.abs(score))) + 1,1)

        let res = this.FIGURE_SPACE.repeat(l - scoreLength - 1) + score.toString()

        if (score >= 0) {
            res = this.FIGURE_SPACE + res
        }

        return res
    }
}

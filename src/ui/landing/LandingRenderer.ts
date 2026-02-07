// src/ui/landing/LandingRenderer.ts

import { start } from "node:repl"

export class LandingRenderer {
    constructor(
        private readonly root: HTMLElement,
        private readonly onStart: () => void
    ) {}

    public render(): void {
        this.root.innerHTML = ""
        
        this.root.className = "app-content-root landing"

        const title = document.createElement("div")
        title.className = "landing-title"
        title.textContent = "QuizBoard"

        const versionLabel = document.createElement("div")
        versionLabel.className = "landing-version-label"
        versionLabel.textContent = "1.0.0"

        const startButton = document.createElement("button")
        startButton.className = "action-button accent"
        startButton.textContent = "Start"
        startButton.onclick = () => {
            this.onStart()
        }

        this.root.append(title,versionLabel,startButton)
    }
}
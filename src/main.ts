// src/main.ts
import { App } from "./app/App.js"
import { SharedWorkerAppPort } from "./app/ports/SharedWorkerAppPort.js"

/**
 * Application entry point.
 */
function main(): void {
    const root = document.getElementById("app")

    if (!root) {
        throw new Error("Root element #app not found")
    }

    const roleParam =
        new URLSearchParams(window.location.search).get("role") ?? ""

    const port = new SharedWorkerAppPort()

    new App(port, roleParam, root)
}

main()

// TODO: game end phase
// TODO: dont show board editor when restarting after game has ended
// TODO: implement dark\light mode switcher, default to system

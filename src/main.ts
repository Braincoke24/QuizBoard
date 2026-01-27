// src/main.ts
import { App } from "./app/App.js"
import { LocalAppPort } from "./app/ports/LocalAppPort.js"

/**
 * Application entry point.
 */
function main(): void {
    const root = document.getElementById("app")

    if (!root) {
        throw new Error("Root element #app not found")
    }

    const roleParam =
        new URLSearchParams(window.location.search).get("role") ?? "player"

    const port = new LocalAppPort()

    new App(port, roleParam, root)
}

main()

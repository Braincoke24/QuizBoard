// src/main.ts
import { App } from "./app/App.js"
import { SharedWorkerAppPort } from "./app/ports/SharedWorkerAppPort.js"
import { ThemeController } from "./ui/shared/ThemeController.js"

/**
 * Application entry point.
 */
function main(): void {
    const root = document.getElementById("app")

    if (!root) {
        throw new Error("Root element #app not found")
    }

    const themeController = new ThemeController(root)
    themeController.init()

    const roleParam =
        new URLSearchParams(window.location.search).get("role") ?? ""

    const port = new SharedWorkerAppPort()

    new App(port, roleParam, root, themeController)
}

main()

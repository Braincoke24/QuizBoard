// src/main.ts
import { mount } from "svelte"
import { SharedWorkerAppPort } from "./app/ports/SharedWorkerAppPort.js"
import { ThemeController } from "./ui/shared/ThemeController.js"
import AppView from "./app/AppView.svelte"

/**
 * Application entry point.
 */
function main(): void {
    const root = document.getElementById("app")

    if (!root) {
        throw new Error("Root element #app not found")
    }

    const themeController = new ThemeController(document.body)
    themeController.init()

    const roleParam =
        new URLSearchParams(window.location.search).get("role") ?? ""

    const port = new SharedWorkerAppPort()

    mount(AppView, {
        target: root,
        props: {
            port: port,
            roleParam: roleParam,
            themeController: themeController,
        },
    })
}

main()

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

// NOTE (erst in zukunft ein problem): wenn man die seite mit ?role=player oeffnet und dann den zwei fenster modus waehlt wird die rolle des aktuellen fensters zwar zu game-master geaendetr, aber die url nicht. Wenn man die seite also neu laedt, hat man ploetzlich die falsche rolle und kann die antworten nicht mehr sehen.
// FIX:
// const url = new URL(window.location.href);
// url.searchParams.set('role', "test");
// window.history.pushState(null, '', url.toString());

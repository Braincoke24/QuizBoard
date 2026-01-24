// // src/main.ts
// import { GameViewAdapter } from "./ui/game/adapters/GameViewAdapter.js"
// import { SharedWorkerGamePort } from "./ui/game/ports/SharedWorkerGamePort.js"
// import { PLAYER_PROFILE } from "./ui/game/profiles/PlayerProfile.js"
// import { GAMEMASTER_PROFILE } from "./ui/game/profiles/GameMasterProfile.js"
// import { SPECTATOR_PROFILE } from "./ui/game/profiles/SpectatorProfile.js"

// const root = document.getElementById("app")!


// // TODO: Spieler eingeben
// // TODO: board erstellen und exportieren

// const port = new SharedWorkerGamePort()

// // temporary for Debug / DevTools
// ;(window as any).resetGame = () => {
//     port.resetGame()
// }

// const profileMap = {
//     "game-master": GAMEMASTER_PROFILE,
//     "player": PLAYER_PROFILE,
//     "spectator": SPECTATOR_PROFILE
// } as const

// type Role = keyof typeof profileMap

// const roleParam = new URLSearchParams(location.search).get("role")

// const role: Role =
//     roleParam && roleParam in profileMap
//         ? roleParam as Role
//         : "spectator"

// const profile = profileMap[role]

// new GameViewAdapter(port, profile, root)

import { LandingController } from "./ui/landing/controllers/LandingController.js"
import { LandingPageAdapter } from "./ui/landing/adapters/LandingPageAdapter.js"
import { BoardDraft } from "./ui/landing/state/BoardDraft.js"

const root = document.getElementById("app")!

const draft: BoardDraft = {
    categories: [
        {
            name: "Allgemeinwissen",
            questions: [
                {
                    text: "Was ist die Hauptstadt von Südafrika?",
                    answer: "Johannesburg"
                },
                {
                    text: "Was ist die Hauptstadt von Deutschland?",
                    answer: "Berlin"
                }
            ]
        },
        {
            name: "Physik",
            questions: [
                {
                    text: "Wie viele Protonen hat Wasserstoffatom?",
                    answer: "1"
                },
                {
                    text: "Bei welcher Temperatur (°C) siedet Wasser bei Normaldruck?",
                    answer: "100 °C"
                }
            ]
        }
    ],
    rowValues: [100,200]
}

const controller = new LandingController()
new LandingPageAdapter(controller, root)

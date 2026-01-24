// src/main.ts
import { GameViewAdapter } from "./ui/game/adapters/GameViewAdapter.js"
import { GameRules } from "./game/GameRules.js"
import { GameController } from "./ui/game/controllers/GameController.js"
import { createDemoGame } from "./bootstrap/createDemoGame.js"
import { SharedWorkerGamePort } from "./ui/game/ports/SharedWorkerGamePort.js"
import { LocalGamePort } from "./ui/game/ports/LocalGamePort.js"
import { PLAYER_PROFILE } from "./ui/game/profiles/PlayerProfile.js"
import { GAMEMASTER_PROFILE } from "./ui/game/profiles/GameMasterProfile.js"
import { SPECTATOR_PROFILE } from "./ui/game/profiles/SpectatorProfile.js"

const root = document.getElementById("app")!

// const { game } = createDemoGame(GameRules.classic())
// const controller = new GameController(game)
// const port = new LocalGamePort(controller)

// TODO: einlesen von board als json
// TODO: Spieler eingeben
// TODO: board erstellen und exportieren

const port = new SharedWorkerGamePort()

// temporary for Debug / DevTools
;(window as any).resetGame = () => {
    port.resetGame()
}

const profileMap = {
    "game-master": GAMEMASTER_PROFILE,
    "player": PLAYER_PROFILE,
    "spectator": SPECTATOR_PROFILE
} as const

type Role = keyof typeof profileMap

const roleParam = new URLSearchParams(location.search).get("role")

const role: Role =
    roleParam && roleParam in profileMap
        ? roleParam as Role
        : "spectator"

const profile = profileMap[role]

new GameViewAdapter(port, profile, root)

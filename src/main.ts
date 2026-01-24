// src/main.ts
import { GameViewAdapter } from "./ui/adapters/GameViewAdapter.js"
import { GameRules } from "./game/GameRules.js"
import { GameController } from "./ui/controllers/GameController.js"
import { createDemoGame } from "./bootstrap/createDemoGame.js"
import { SharedWorkerGamePort } from "./ui/ports/SharedWorkerGamePort.js"
import { LocalGamePort } from "./ui/ports/LocalGamePort.js"
import { PLAYER_PROFILE } from "./ui/profiles/PlayerProfile.js"
import { GAMEMASTER_PROFILE } from "./ui/profiles/GameMasterProfile.js"
import { SPECTATOR_PROFILE } from "./ui/profiles/SpectatorProfile.js"

const root = document.getElementById("app")!

// const { game } = createDemoGame(GameRules.classic())
// const controller = new GameController(game)
// const port = new LocalGamePort(controller)

const port = new SharedWorkerGamePort()

new GameViewAdapter(port, PLAYER_PROFILE, root)

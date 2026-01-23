import { GameRules } from "./game/GameRules.js"
import { GameController } from "./ui/controllers/GameController.js"
import { LocalGamePort } from "./ui/ports/LocalGamePort.js"
import { createDemoGame } from "./bootstrap/createDemoGame.js"
import { GameViewAdapter } from "./ui/adapters/GameViewAdapter.js"
import { PLAYER_PROFILE } from "./ui/profiles/PlayerProfile.js"
import { GAMEMASTER_PROFILE } from "./ui/profiles/GameMasterProfile.js"
import { SPECTATOR_PROFILE } from "./ui/profiles/SpectatorProfile.js"

const { game } = createDemoGame(GameRules.classic())

const controller = new GameController(game)
const port = new LocalGamePort(controller)

const root = document.getElementById("app")!
new GameViewAdapter(port, PLAYER_PROFILE, root)

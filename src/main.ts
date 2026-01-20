import { GameRules } from "./game/GameRules.js"
import { GameController } from "./ui/controllers/GameController.js"
import { LocalGamePort } from "./ui/ports/LocalGamePort.js"
import { createDemoGame } from "./bootstrap/createDemoGame.js"
import { PlayerView } from "./ui/views/PlayerView.js"

const { game } = createDemoGame(GameRules.classic())

const controller = new GameController(game)
const port = new LocalGamePort(controller)

const root = document.getElementById("app")!
new PlayerView(port, root)

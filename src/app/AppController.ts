// src/app/AppController.ts
import { AppPhase } from "./AppPhase.js"
import { GameController } from "../ui/game/GameController.js"
import { BoardDraftController } from "../ui/editBoard/BoardDraftController.js"
import { PreGameSetupController } from "../ui/preGameSetup/PreGameSetupController.js"

export class AppController {
    private phase = AppPhase.EDIT_BOARD

}

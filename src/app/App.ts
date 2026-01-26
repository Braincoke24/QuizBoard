// src/app/App.ts
import { AppPort } from "./ports/AppPort.js"
import { RoleResolver } from "../shared/RoleResolver.js"
import { UIViewProfile } from "../ui/shared/view/UIViewProfile.js"

export class App {
    private readonly port: AppPort
    private readonly root: HTMLElement
    private readonly profile: UIViewProfile

    constructor(port: AppPort, roleParam: string, root: HTMLElement) {
        this.port = port
        this.root = root
        this.profile = RoleResolver.resolve(roleParam)
    }
}

// src/ui/buzzerConfig/BuzzerConfigAdapter.ts
import { BuzzerConfigAction } from "./BuzzerConfigAction.js"
import { BuzzerConfigRenderer } from "./BuzzerConfigRenderer.js"
import { BuzzerConfigSnapshot } from "./BuzzerConfigState.js"

export const keyCodeNameMap = (keyCode: string):string => {
    if (keyCode.startsWith("Digit")) return keyCode.slice(5)
    if (keyCode.startsWith("Numpad")) return "Num" + keyCode.slice(6)
    if (keyCode.startsWith("Key")) return keyCode.slice(3)

    return keyCode
}

export class BuzzerConfigAdapter {
    private readonly renderer: BuzzerConfigRenderer
    private readonly keyHandler: (e: KeyboardEvent) => void

    constructor(
        dispatch: (action: BuzzerConfigAction) => void,
        root: HTMLElement
    ) {
        const skipPlayer = (): void => {
            dispatch({
                type: "BUZZER_CONFIG/SKIP_PLAYER"
            })
        }

        this.renderer = new BuzzerConfigRenderer(
            root,
            skipPlayer
        )

        this.keyHandler = (e: KeyboardEvent): void => {
            if (
                e.metaKey ||
                e.altKey ||
                e.ctrlKey ||
                e.key.length !== 1
            ) {
                return
            }

            e.preventDefault()
            dispatch({
                type: "BUZZER_CONFIG/ASSIGN_KEY",
                key: keyCodeNameMap(e.code)
            })
        }

        window.addEventListener("keydown", this.keyHandler)
    }

    public render(snapshot: BuzzerConfigSnapshot): void {
        this.renderer.render(snapshot)

        if (snapshot.done) {
            this.destroy()
        }
    }

    public destroy(): void {
        window.removeEventListener("keydown", this.keyHandler)
    }
}

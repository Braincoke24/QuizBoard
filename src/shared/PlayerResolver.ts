// src/shared/PlayerResolver.ts
import { Player } from "../game/Player.js"
import { PlayerUIState } from "../ui/GameUIState.js"

/**
 * Internal helper to resolve UI player references to domain players.
 * Not intended to be exposed to the UI layer.
 */
export class PlayerResolver {
    private readonly playerById = new Map<string, Player>()

    /**
     * Creates a resolver for the given players.
     */
    public constructor(players: readonly Player[]) {
        for (const player of players) {
            this.playerById.set(player.id, player)
        }
    }

    /**
     * Resolves a PlayerUIState to the corresponding Player.
     * Throws if the player is unknown.
     */
    public resolve(uiPlayer: PlayerUIState): Player {
        const player = this.playerById.get(uiPlayer.id)

        if (!player) {
            throw new Error(`Unknown player id: ${uiPlayer.id}`)
        }

        return player
    }
}

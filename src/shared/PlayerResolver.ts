// src/shared/PlayerResolver.ts
import { Player } from "../game/Player.js"

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
     * Resolves a player id to the corresponding Player.
     * Throws if the player id is unknown.
     */
    public resolve(playerId: string): Player {
        const player = this.playerById.get(playerId)

        if (!player) {
            throw new Error(`Unknown playerId: ${playerId}`)
        }

        return player
    }
}

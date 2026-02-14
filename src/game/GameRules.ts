// src/game/GameRules.ts
/**
 * Defines all scoring rules for a game.
 *
 * Values are multipliers applied to the base question value.
 */
export class GameRules {
    readonly firstWrongMultiplier: number
    readonly buzzCorrectMultiplier: number
    readonly buzzWrongMultiplier: number

    constructor(
        firstWrongMultiplier: number,
        buzzCorrectMultiplier: number,
        buzzWrongMultiplier: number,
    ) {
        this.firstWrongMultiplier = firstWrongMultiplier
        this.buzzCorrectMultiplier = buzzCorrectMultiplier
        this.buzzWrongMultiplier = buzzWrongMultiplier
    }

    static classic(): GameRules {
        return new GameRules(0.5, 0.5, 0.5)
    }

    static hard(): GameRules {
        return new GameRules(1, 1, 1)
    }
}

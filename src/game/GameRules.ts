// src/game/GameRules.ts
/**
 * Defines all scoring rules for a game.
 * 
 * All values are multipliers applied to the base question value.
 * Example:
 *   0.5 = half points
 *   1.0 = full points
 */
export class GameRules {
    /** Penalty applied when the starting player answers incorrectly */
    readonly firstWrongMultiplier: number

    /** Reward applied when a buzzing player answers correctly */
    readonly buzzCorrectMultiplier: number

    /** Penalty applied when a buzzing player answers incorrectly */
    readonly buzzWrongMultiplier: number

    constructor(
        firstWrongMultiplier: number,
        buzzCorrectMultiplier: number,
        buzzWrongMultiplier: number
    ) {
        this.firstWrongMultiplier = firstWrongMultiplier
        this.buzzCorrectMultiplier = buzzCorrectMultiplier
        this.buzzWrongMultiplier = buzzWrongMultiplier
    }

    /** Classic Jeopardy rules */
    static classic(): GameRules {
        return new GameRules(0.5, 0.5, 0.5)
    }

    /** More punishing rule set */
    static hard(): GameRules {
        return new GameRules(1, 1, 1)
    }
}

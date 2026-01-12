/**
 * Represents a player in the game.
 */
export class Player {
    /** Unique identifier (used for comparisons and persistence) */
    readonly id: string

    /** Display name of the player */
    readonly name: string

    /** The player's current score */
    private _score = 0

    /**
     * @param id Unique player ID
     * @param name Display name
     */
    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }

    /** Current score */
    get score() {
        return this._score
    }

    /**
     * Adds (or subtracts) points from the player's score.
     *
     * @param points Positive or negative number of points
     */
    addScore(points: number) {
        this._score += points
    }
}

export class Player {
    readonly id: string
    readonly name: string
    private _score = 0

    constructor(id: string, name: string) {
        this.id = id
        this.name = name
    }

    get score() {
        return this._score
    }

    /** Adds points to the score. Always rounds up to the next integer. */
    addScore(points: number) {
        this._score += Math.ceil(points)
    }
}

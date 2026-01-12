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

    addScore(points: number) {
        this._score += points
    }
}

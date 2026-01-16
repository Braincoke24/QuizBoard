// tests/game/player.test.ts
import { describe, it, expect } from "vitest"
import { Player } from "../../src/game/Player.js"

describe("Player", () => {
    it("positive points get added correctly to players score", () => {
        const alice = new Player("a","Alice")
        const points = 50
        alice.addScore(points)
        
        expect(alice.score).toBe(points)
    })

    it("negative points get add correctly to players score", () => {
        const alice = new Player("a","Alice")
        const points = -30
        alice.addScore(points)
        
        expect(alice.score).toBe(points)
    })
})

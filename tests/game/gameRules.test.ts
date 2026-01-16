// tests/game/gameRules.test.ts
import { describe, it, expect } from "vitest"
import { GameRules } from "../../src/game/GameRules.js"

describe("GameRules", () => {
    it("classic returns expected multipliers", () => {
        const rules = GameRules.classic()
        expect(rules.firstWrongMultiplier).toBe(0.5)
        expect(rules.buzzCorrectMultiplier).toBe(0.5)
        expect(rules.buzzWrongMultiplier).toBe(0.5)
    })

    it("hard returns expected multipliers", () => {
        const rules = GameRules.hard()
        expect(rules.firstWrongMultiplier).toBe(1)
        expect(rules.buzzCorrectMultiplier).toBe(1)
        expect(rules.buzzWrongMultiplier).toBe(1)
    })

    it("custom rules work with custom values", () => {
        const rules = new GameRules(0.3, 0.6, 1.8)
        expect(rules.firstWrongMultiplier).toBe(0.3)
        expect(rules.buzzCorrectMultiplier).toBe(0.6)
        expect(rules.buzzWrongMultiplier).toBe(1.8)
    })
})

// tests/turn.test.ts
// TODO: also test hard rules and/or custom rules
import { describe, it, expect } from "vitest"
import { Player } from "../src/game/Player.js"
import { Question } from "../src/game/Question.js"
import { Turn } from "../src/game/Turn.js"
import { GameRules } from "../src/game/GameRules.js"
import { TurnState } from "../src/game/TurnState.js"

describe("Turn", () => {
    it("starter gets full points on correct answer", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const rules = GameRules.classic()

        const turn = new Turn(alice, [alice, bob], rules)
        turn.selectQuestion(question)
        turn.submitAnswer(true)

        expect(alice.score).toBe(100)
        expect(turn.state).toBe(TurnState.RESOLVED)
    })

    it("starter loses half points on wrong answer", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const rules = GameRules.classic()

        const turn = new Turn(alice, [alice, bob], rules)
        turn.selectQuestion(question)
        turn.submitAnswer(false)

        expect(alice.score).toBe(-50)
        expect(turn.state).toBe(TurnState.BUZZING)
    })

    it("buzzing player can answer correctly", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const rules = GameRules.classic()

        const turn = new Turn(alice, [alice, bob], rules)
        turn.selectQuestion(question)
        turn.submitAnswer(false) // Alice wrong
        turn.buzz(bob)
        turn.submitAnswer(true) // Bob correct

        expect(bob.score).toBe(50)
        expect(turn.state).toBe(TurnState.RESOLVED)
    })

    it("pass ends the turn when no one wants to buzz", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const rules = GameRules.classic()

        const turn = new Turn(alice, [alice, bob], rules)
        turn.selectQuestion(question)
        turn.submitAnswer(false)
        turn.pass()

        expect(turn.state).toBe(TurnState.RESOLVED)
    })

    it("turn automatically resolves if all players have tried", () => {
        const alice = new Player("a", "Alice")
        const bob = new Player("b", "Bob")
        const question = new Question("2+2?", "4", 100)
        const rules = GameRules.classic()

        const turn = new Turn(alice, [alice, bob], rules)
        turn.selectQuestion(question)
        turn.submitAnswer(false) // Alice wrong
        turn.buzz(bob)
        turn.submitAnswer(false) // Bob wrong

        expect(turn.state).toBe(TurnState.RESOLVED)
    })
})

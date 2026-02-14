// tests/game/turn.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { Player } from "../../src/game/Player.js"
import { Question } from "../../src/game/board/Question.js"
import { Turn } from "../../src/game/turn/Turn.js"
import { GameRules } from "../../src/game/GameRules.js"
import { TurnState } from "../../src/game/turn/TurnState.js"

let alice: Player, bob: Player
let question: Question
let rules: GameRules
let turn: Turn

const points = 100

beforeEach(() => {
    alice = new Player("a", "Alice")
    bob = new Player("b", "Bob")
    question = new Question("2+2?", "4", points)
    rules = GameRules.classic()
    turn = new Turn(alice, [alice, bob], rules)
})

describe("Turn", () => {
    it("starter gets full points on correct answer", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(true)

        expect(alice.score).toBe(points)
        expect(bob.score).toBe(0)
        expect(turn.state).toBe(TurnState.RESOLVING)
    })

    it("starter loses points on wrong answer", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(false)

        expect(alice.score).toBe(
            Math.ceil(-points * rules.firstWrongMultiplier),
        )
        expect(bob.score).toBe(0)
        expect(turn.state).toBe(TurnState.BUZZING)
    })

    it("buzzing player can answer correctly", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(false) // Alice wrong
        turn.buzz(bob)
        turn.submitAnswer(true) // Bob correct

        expect(alice.score).toBe(
            Math.ceil(-points * rules.firstWrongMultiplier),
        )
        expect(bob.score).toBe(Math.ceil(points * rules.buzzCorrectMultiplier))
        expect(turn.state).toBe(TurnState.RESOLVING)
    })

    it("pass advances the turn to resolving state when no one wants to buzz", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(false)
        turn.pass()

        expect(turn.state).toBe(TurnState.RESOLVING)
    })

    it("turn automatically advances to resolving state if all players have tried", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(false) // Alice wrong
        turn.buzz(bob)
        turn.submitAnswer(false) // Bob wrong

        expect(turn.state).toBe(TurnState.RESOLVING)
    })

    it("turn resolves when continue is invoked", () => {
        turn.selectQuestion(question, "Test category")
        turn.submitAnswer(true) // Alice correct
        turn.continue()

        expect(turn.state).toBe(TurnState.RESOLVED)
    })
})

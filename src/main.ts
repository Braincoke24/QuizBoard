import { Player } from "./game/Player.js"
import { Question } from "./game/Question.js"
import { Category } from "./game/Category.js"
import { Board } from "./game/Board.js"
import { GameRules } from "./game/GameRules.js"
import { Game } from "./game/Game.js"
import { GameController } from "./ui/GameController.js"
import { CliApp } from "./cli/CliApp.js"

/**
 * Creates a simple demo board for the CLI.
 */
function createBoard(): Board {
    const categories: Category[] = [
        new Category("Science", [
            new Question("What planet is known as the Red Planet?", "Mars", 100),
            new Question("What gas do plants breathe in?", "CO2", 200),
            new Question("What is H2O?", "Water", 300)
        ]),
        new Category("History", [
            new Question("Who was the first US president?", "Washington", 100),
            new Question("In which year did WW2 end?", "1945", 200),
            new Question("What wall fell in 1989?", "Berlin Wall", 300)
        ]),
        new Category("Games", [
            new Question("Who is Mario's brother?", "Luigi", 100),
            new Question("What company makes the PlayStation?", "Sony", 200),
            new Question("What game features the Triforce?", "Zelda", 300)
        ])
    ]

    return new Board(categories)
}

/**
 * Application entry point.
 */
async function main() {
    const players = [
        new Player("a", "Alice"),
        new Player("b", "Bob"),
        new Player("c", "Charlie")
    ]

    const board = createBoard()
    const rules = GameRules.classic()
    const game = new Game(players, board, rules)
    const controller = new GameController(game)

    const app = new CliApp(controller)
    await app.run()
}

main()

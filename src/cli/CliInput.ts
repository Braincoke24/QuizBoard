// src/cli/CliInput.ts
import readline from "node:readline"

/**
 * Handles reading lines from stdin.
 */
export class CliInput {
    private readonly rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    /**
     * Reads one line from the user.
     */
    public async readLine(): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question("> ", (answer) => resolve(answer.trim()))
        })
    }
}

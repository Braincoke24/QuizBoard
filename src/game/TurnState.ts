/**
 * Represents the lifecycle of a turn.
 */
export enum TurnState {
    /** The active player must choose a question */
    SELECTING,

    /** A player is currently answering */
    ANSWERING,

    /** Waiting for other players to buzz in */
    BUZZING,

    /** The turn has finished */
    RESOLVED
}

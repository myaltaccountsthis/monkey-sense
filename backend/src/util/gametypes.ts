export interface WSMessage {
    type: string;
    data: any;
    error?: string;
}

export interface UserData {
    username: string;
    inGame: boolean;

    tries: number;
    answeredCorrect: boolean;
    points: number;
    delta: number;
}

export interface GameState {
    timer: number;
    startTime: number;
    question: string;
    rounds: number;
}

export enum ServerState {
    CANNOT_START,       // Too few players (initially or after the round when players leave)
    WAITING_START,      // Waiting for game to start (after enough players join or after a game ends due to round limit)
    WAITING_QUESTION,   // Countdown for questions to appear
    IN_PROGRESS,        // Players are answering the question
    WAITING_NEXT,       // Display answer, player ranks/points, end game if round limit reached or too few players
    ENDING_GAME         // Display final results, wait to start a new game
}

export const NUM_TRIES = 3;
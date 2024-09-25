export const MathJaxConfig = {
  loader: {load: ['input/asciimath', 'output/svg']},
  options: {
    menuOptions: {
      settings: {
        inTabOrder: false
      }
    },
  },
}

export const timePerQuestion = 7500;
export function getTestDuration(gameMode: GameMode, testLength: number) {
  if (gameMode == "Zetamac")
    return testLength * 1000;
  return testLength * timePerQuestion;
}
export function getNumQuestions(gameMode: GameMode, testLength: number) {
  return gameMode === "Zetamac" ? testLength * 2 : testLength
}

export const enterModes = ["Default", "No Enter", "Hardcore", "Test"];
export type EnterMode = typeof enterModes[number];

export const gameModes = ["Number Sense", "Zetamac", "Estimate"];
export type GameMode = typeof gameModes[number];
export const gameModeMappings: {[key: GameMode]: string} = {
  "Number Sense": "ns",
  "Zetamac": "zm",
  "Estimate": "est"
};

export const testLengths = [10, 20, 40, 80, 120, 160]
export type TestLength = typeof testLengths[number];
export function isValidTestLength(testLength: number | string | null) {
  if (!testLength || typeof testLength == "string" && !(testLength = parseInt(testLength)) || !testLengths.includes(testLength))
    return null;
  return testLength;
};

export interface TestOptions {
  id: string;
  testLength: number;
  gameMode: GameMode;
};

export interface Question {
  ans: number;
  str: string;
  ansStr?: string;
  ansArr?: string[];
  guess?: boolean;
};
export const defaultQuestion = {ans: 0, str: ""};

export interface ModeQuestion {
  category: string;
  question: Question;
};

export interface AnsweredQuestion {
  category: string;
  incorrect: boolean;
  time: number;
  question: Question;
  response?: string;
};

export interface AnswerJudgement {
  correct: boolean;
  other?: string;
};

export type QuestionGeneratorFunction = (...args: any[]) => Question;

export interface QuestionGenerator {
  name: string;
  weight: number;
  tier: number;
  func: QuestionGeneratorFunction;
}

export interface Message {
  type: string;
  data: any;
  extra?: MessageExtra;
  tag?: string;
}
export interface MessageExtra {
  time: number;
  question: Question;
  response: string;
};

export interface ModeData {
  lastT: number;
  total: number;
  testLength: number;
  question: Question;
  enterMode: EnterMode;
  gameMode: GameMode;
}

export interface LeaderboardEntry {
  name: string;
  correct: number;
  answered: number;
  test_length: number;
  adjusted: number;
  time: number;
}

export interface TestResults {
  questions: Question[];
  judgements: AnswerJudgement[];
  answers: string[];
  entry: LeaderboardEntry;
}
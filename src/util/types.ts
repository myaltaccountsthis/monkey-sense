export const MathJaxConfig = {
  loader: {load: ['input/asciimath', 'output/chtml', 'ui/menu']}
}

export const enterModes = ["Default", "No Enter", "Hardcore", "Test"];
export type EnterMode = typeof enterModes[number];

export const gameModes = ["Number Sense", "Zetamac", "Estimate"];
export type GameMode = typeof gameModes[number];

export const testLengths = [10, 20, 40, 80, 120, 160]
export type TestLength = typeof testLengths[number];

export interface Question {
  ans: number;
  str: string;
  ansStr?: string;
  ansArr?: string[];
  guess?: boolean;
}
export const defaultQuestion = {ans: 0, str: ""};

export interface ModeQuestion {
  category: string;
  question: Question;
}

export interface AnsweredQuestion {
  category: string;
  incorrect: boolean;
  time: number;
  question: Question;
  response?: string;
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
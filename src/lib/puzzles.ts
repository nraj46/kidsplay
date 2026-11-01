/**
 * Puzzle generators by age level (2–6 years).
 * Called only from click handlers / effects in the browser — never at build.
 */
import { FLASH_CATEGORIES, LETTERS } from "./content";

export interface PuzzleOption {
  id: string;
  big: string;   // big visual (emoji or letter or number)
  label?: string;
}

export interface Puzzle {
  kind: "match" | "firstletter" | "pattern" | "count" | "missing" | "simon";
  prompt: string;
  say: string;
  visual?: string;      // big emoji / sequence shown with the question
  visualStars?: number; // for count puzzles
  options: PuzzleOption[];
  answerId: string;
  simonNotes?: number[]; // for simon puzzles (indexes into NOTES)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors<T>(pool: T[], correct: T, count: number, key: (x: T) => string): T[] {
  const rest = shuffle(pool.filter((x) => key(x) !== key(correct)));
  return rest.slice(0, count);
}

const ALL_CARDS = FLASH_CATEGORIES.flatMap((c) => c.cards).filter((c) => c.emoji);

function matchPuzzle(optionCount: number): Puzzle {
  const card = pick(ALL_CARDS);
  const others = distractors(ALL_CARDS, card, optionCount - 1, (c) => c.label);
  const options = shuffle([card, ...others]).map((c) => ({ id: c.label, big: c.emoji as string, label: c.label }));
  return {
    kind: "match",
    prompt: `Can you find the ${card.label}?`,
    say: `Can you find the ${card.label}?`,
    visual: card.emoji,
    options,
    answerId: card.label,
  };
}

function firstLetterPuzzle(optionCount: number): Puzzle {
  const card = pick(LETTERS);
  const others = distractors(LETTERS, card, optionCount - 1, (c) => c.letter);
  const options = shuffle([card, ...others]).map((c) => ({ id: c.letter, big: c.letter }));
  return {
    kind: "firstletter",
    prompt: `${card.word} starts with which letter?`,
    say: `${card.word}. ${card.word} starts with which letter?`,
    visual: card.emoji,
    options,
    answerId: card.letter,
  };
}

const PATTERN_SETS: { seq: string[]; answer: string; pool: string[] }[] = [
  { seq: ["🍎", "🍌", "🍎", "🍌", "🍎"], answer: "🍌", pool: ["🍌", "🍇", "🍓"] },
  { seq: ["⭐", "⭐", "🌙", "⭐", "⭐"], answer: "🌙", pool: ["🌙", "☀️", "⭐"] },
  { seq: ["🐶", "🐱", "🐶", "🐱", "🐶"], answer: "🐱", pool: ["🐱", "🐰", "🐶"] },
  { seq: ["🔴", "🔵", "🔴", "🔵", "🔴"], answer: "🔵", pool: ["🔵", "🟢", "🟡"] },
  { seq: ["🚗", "🚗", "🚌", "🚗", "🚗"], answer: "🚌", pool: ["🚌", "🚂", "🚗"] },
];

function patternPuzzle(): Puzzle {
  const p = pick(PATTERN_SETS);
  const options = shuffle(p.pool).map((e) => ({ id: e, big: e }));
  return {
    kind: "pattern",
    prompt: "What comes next?",
    say: "What comes next in the pattern?",
    visual: `${p.seq.join(" ")} ❓`,
    options,
    answerId: p.answer,
  };
}

function countPuzzle(max: number): Puzzle {
  const n = 2 + Math.floor(Math.random() * (max - 1));
  const wrong = shuffle([n - 1, n + 1, n + 2].filter((x) => x >= 1 && x !== n)).slice(0, 2);
  const options = shuffle([n, ...wrong]).map((x) => ({ id: String(x), big: String(x) }));
  return {
    kind: "count",
    prompt: "How many stars do you see?",
    say: "How many stars do you see? Count with me!",
    visualStars: n,
    options,
    answerId: String(n),
  };
}

function missingLetterPuzzle(optionCount: number): Puzzle {
  const start = Math.floor(Math.random() * 22); // leave room for a run of 4
  const run = LETTERS.slice(start, start + 4);
  const missingIdx = 1 + Math.floor(Math.random() * 2); // hide a middle letter
  const missing = run[missingIdx];
  const shown = run.map((c, i) => (i === missingIdx ? "❓" : c.letter)).join("  ");
  const others = distractors(LETTERS, missing, optionCount - 1, (c) => c.letter);
  const options = shuffle([missing, ...others]).map((c) => ({ id: c.letter, big: c.letter }));
  return {
    kind: "missing",
    prompt: "Which letter is missing?",
    say: "Which letter is missing?",
    visual: shown,
    options,
    answerId: missing.letter,
  };
}

function simonPuzzle(noteCount: number): Puzzle {
  const notes = Array.from({ length: noteCount }, () => Math.floor(Math.random() * 8));
  return {
    kind: "simon",
    prompt: "Listen to the notes… then play them back!",
    say: "Listen carefully, then play the notes back!",
    options: [],
    answerId: "simon",
    simonNotes: notes,
  };
}

/** Generate the next puzzle for an age (2–6). */
export function nextPuzzle(age: number): Puzzle {
  switch (age) {
    case 2:
      return matchPuzzle(2);
    case 3:
      return pick([() => matchPuzzle(3), () => firstLetterPuzzle(3)])();
    case 4:
      return pick([patternPuzzle, () => countPuzzle(6), () => matchPuzzle(3)])();
    case 5:
      return pick([() => missingLetterPuzzle(3), () => countPuzzle(10), () => firstLetterPuzzle(3)])();
    case 6:
      return pick([() => simonPuzzle(3), () => missingLetterPuzzle(4), patternPuzzle])();
    default:
      return matchPuzzle(2);
  }
}

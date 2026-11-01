/** KidsPlay content: alphabet words, sargam notes, and colors. */

export interface LetterCard {
  letter: string;
  word: string;
  emoji: string;
  color: string; // tailwind bg class
}

export const LETTERS: LetterCard[] = [
  { letter: "A", word: "Apple", emoji: "🍎", color: "bg-red-400" },
  { letter: "B", word: "Ball", emoji: "🏀", color: "bg-orange-400" },
  { letter: "C", word: "Cat", emoji: "🐱", color: "bg-amber-400" },
  { letter: "D", word: "Dog", emoji: "🐶", color: "bg-yellow-400" },
  { letter: "E", word: "Elephant", emoji: "🐘", color: "bg-lime-400" },
  { letter: "F", word: "Fish", emoji: "🐟", color: "bg-green-400" },
  { letter: "G", word: "Grapes", emoji: "🍇", color: "bg-emerald-400" },
  { letter: "H", word: "Horse", emoji: "🐴", color: "bg-teal-400" },
  { letter: "I", word: "Ice Cream", emoji: "🍦", color: "bg-cyan-400" },
  { letter: "J", word: "Juice", emoji: "🧃", color: "bg-sky-400" },
  { letter: "K", word: "Kite", emoji: "🪁", color: "bg-blue-400" },
  { letter: "L", word: "Lion", emoji: "🦁", color: "bg-indigo-400" },
  { letter: "M", word: "Monkey", emoji: "🐵", color: "bg-violet-400" },
  { letter: "N", word: "Nose", emoji: "👃", color: "bg-purple-400" },
  { letter: "O", word: "Orange", emoji: "🍊", color: "bg-fuchsia-400" },
  { letter: "P", word: "Parrot", emoji: "🦜", color: "bg-pink-400" },
  { letter: "Q", word: "Queen", emoji: "👸", color: "bg-rose-400" },
  { letter: "R", word: "Rabbit", emoji: "🐰", color: "bg-red-400" },
  { letter: "S", word: "Sun", emoji: "☀️", color: "bg-orange-400" },
  { letter: "T", word: "Tiger", emoji: "🐯", color: "bg-amber-400" },
  { letter: "U", word: "Umbrella", emoji: "☂️", color: "bg-sky-400" },
  { letter: "V", word: "Violin", emoji: "🎻", color: "bg-indigo-400" },
  { letter: "W", word: "Whale", emoji: "🐳", color: "bg-blue-400" },
  { letter: "X", word: "Xylophone", emoji: "🎵", color: "bg-violet-400" },
  { letter: "Y", word: "Yo-Yo", emoji: "🪀", color: "bg-pink-400" },
  { letter: "Z", word: "Zebra", emoji: "🦓", color: "bg-teal-400" },
];

export const NUMBER_WORDS = [
  "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen", "Twenty",
];

export const NUMBER_COLORS = [
  "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-yellow-400", "bg-lime-400",
  "bg-green-400", "bg-emerald-400", "bg-teal-400", "bg-cyan-400", "bg-sky-400",
  "bg-blue-400", "bg-indigo-400", "bg-violet-400", "bg-purple-400", "bg-fuchsia-400",
  "bg-pink-400", "bg-rose-400", "bg-red-400", "bg-orange-400", "bg-amber-400",
];

/**
 * Sargam (Indian classical) notes on a C-major scale.
 * Frequencies are equal-temperament from C4 = 261.63 Hz.
 */
export interface Note {
  name: string;      // sargam name
  western: string;   // western note name
  freq: number;
  color: string;
  keyboard: string;  // computer key that plays it
}

export const NOTES: Note[] = [
  { name: "Sa", western: "C", freq: 261.63, color: "bg-red-400", keyboard: "a" },
  { name: "Re", western: "D", freq: 293.66, color: "bg-orange-400", keyboard: "s" },
  { name: "Ga", western: "E", freq: 329.63, color: "bg-amber-400", keyboard: "d" },
  { name: "Ma", western: "F", freq: 349.23, color: "bg-green-400", keyboard: "f" },
  { name: "Pa", western: "G", freq: 392.0, color: "bg-teal-400", keyboard: "g" },
  { name: "Dha", western: "A", freq: 440.0, color: "bg-sky-400", keyboard: "h" },
  { name: "Ni", western: "B", freq: 493.88, color: "bg-indigo-400", keyboard: "j" },
  { name: "Sa′", western: "C′", freq: 523.25, color: "bg-pink-400", keyboard: "k" },
];

/** A tiny built-in tune on the sargam scale (indexes into NOTES). */
export const SCALE_SONG = [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0];
export const TWINKLE = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0];

/** Flashcards for the Slide Cards mode. */
export interface FlashCard {
  label: string;
  emoji?: string;
  bg?: string; // for color cards
  say?: string;
}

export interface FlashCategory {
  id: string;
  label: string;
  cards: FlashCard[];
}

export const FLASH_CATEGORIES: FlashCategory[] = [
  {
    id: "animals",
    label: "🐶 Animals",
    cards: [
      { label: "Dog", emoji: "🐶" }, { label: "Cat", emoji: "🐱" }, { label: "Lion", emoji: "🦁" },
      { label: "Elephant", emoji: "🐘" }, { label: "Monkey", emoji: "🐵" }, { label: "Tiger", emoji: "🐯" },
      { label: "Cow", emoji: "🐮" }, { label: "Pig", emoji: "🐷" }, { label: "Duck", emoji: "🦆" },
      { label: "Frog", emoji: "🐸" }, { label: "Bear", emoji: "🐻" }, { label: "Penguin", emoji: "🐧" },
    ],
  },
  {
    id: "fruits",
    label: "🍎 Fruits",
    cards: [
      { label: "Apple", emoji: "🍎" }, { label: "Banana", emoji: "🍌" }, { label: "Grapes", emoji: "🍇" },
      { label: "Orange", emoji: "🍊" }, { label: "Strawberry", emoji: "🍓" }, { label: "Watermelon", emoji: "🍉" },
      { label: "Mango", emoji: "🥭" }, { label: "Pineapple", emoji: "🍍" }, { label: "Peach", emoji: "🍑" },
      { label: "Lemon", emoji: "🍋" },
    ],
  },
  {
    id: "colors",
    label: "🎨 Colors",
    cards: [
      { label: "Red", bg: "bg-red-500" }, { label: "Blue", bg: "bg-blue-500" },
      { label: "Green", bg: "bg-green-500" }, { label: "Yellow", bg: "bg-yellow-400" },
      { label: "Orange", bg: "bg-orange-500" }, { label: "Purple", bg: "bg-purple-500" },
      { label: "Pink", bg: "bg-pink-400" }, { label: "Brown", bg: "bg-amber-800" },
    ],
  },
  {
    id: "shapes",
    label: "🔷 Shapes",
    cards: [
      { label: "Circle", emoji: "🔵" }, { label: "Square", emoji: "🟦" }, { label: "Triangle", emoji: "🔺" },
      { label: "Star", emoji: "⭐" }, { label: "Heart", emoji: "❤️" }, { label: "Rectangle", emoji: "🟥" },
      { label: "Diamond", emoji: "🔷" }, { label: "Moon", emoji: "🌙" },
    ],
  },
  {
    id: "vehicles",
    label: "🚗 Vehicles",
    cards: [
      { label: "Car", emoji: "🚗" }, { label: "Bus", emoji: "🚌" }, { label: "Train", emoji: "🚂" },
      { label: "Airplane", emoji: "✈️" }, { label: "Boat", emoji: "⛵" }, { label: "Bicycle", emoji: "🚲" },
      { label: "Truck", emoji: "🚚" }, { label: "Rocket", emoji: "🚀" },
    ],
  },
];

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LETTERS, NOTES, NUMBER_COLORS, NUMBER_WORDS, SCALE_SONG, TWINKLE } from "@/lib/content";

type Mode = "abc" | "num" | "sargam" | "piano";

interface Display {
  big: string;
  sub: string;
  emoji?: string;
  color: string;
  stars?: number;
  stamp: number;
}

const MODES: { id: Mode; label: string }[] = [
  { id: "abc", label: "🔤 ABC" },
  { id: "num", label: "🔢 123" },
  { id: "sargam", label: "🎶 Sa Re Ga Ma" },
  { id: "piano", label: "🎹 Piano" },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>("abc");
  const [display, setDisplay] = useState<Display>({
    big: "👋",
    sub: "Tap anything — everything talks and plays!",
    color: "bg-yellow-300",
    stamp: 0,
  });
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const voicesRef = useRef(new Map<number, { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode }>());
  const downAtRef = useRef(new Map<number, number>());

  const getCtx = useCallback(() => {
    if (!audioRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioRef.current = new AC();
    }
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, seconds = 0.8) => {
      try {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        osc2.type = "sine";
        osc2.frequency.value = freq * 2;
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
        const gain2 = ctx.createGain();
        gain2.gain.value = 0.25;
        osc.connect(gain);
        osc2.connect(gain2);
        gain2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc2.start(now);
        osc.stop(now + seconds + 0.05);
        osc2.stop(now + seconds + 0.05);
      } catch {
        /* audio not available — visuals still work */
      }
    },
    [getCtx],
  );

  /** Start a note that keeps playing until stopTone is called (hold-to-play). */
  const startTone = useCallback(
    (idx: number, freq: number) => {
      try {
        const ctx = getCtx();
        // stop any existing voice for this key first
        const existing = voicesRef.current.get(idx);
        if (existing) {
          try { existing.osc.stop(); existing.osc2.stop(); } catch { /* already stopped */ }
          existing.gain.disconnect();
          voicesRef.current.delete(idx);
        }
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        osc2.type = "sine";
        osc2.frequency.value = freq * 2;
        const gain2 = ctx.createGain();
        gain2.gain.value = 0.25;
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.5, now + 0.03);
        gain.gain.setTargetAtTime(0.35, now + 0.05, 0.4); // gentle settle while held
        osc.connect(gain);
        osc2.connect(gain2);
        gain2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc2.start(now);
        voicesRef.current.set(idx, { osc, osc2, gain });
      } catch {
        /* audio not available */
      }
    },
    [getCtx],
  );

  const stopTone = useCallback((idx: number) => {
    const v = voicesRef.current.get(idx);
    if (!v) return;
    voicesRef.current.delete(idx);
    try {
      const ctx = audioRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setTargetAtTime(0.0001, now, 0.05);
      v.osc.stop(now + 0.25);
      v.osc2.stop(now + 0.25);
    } catch {
      /* already stopped */
    }
  }, []);

  const stopAllTones = useCallback(() => {
    Array.from(voicesRef.current.keys()).forEach((k) => stopTone(k));
  }, [stopTone]);

  const speak = useCallback((text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = 1.15;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      /* speech not available */
    }
  }, []);

  const stopSong = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
    setActiveNote(null);
    stopAllTones();
  }, [stopAllTones]);

  useEffect(() => () => stopSong(), [stopSong]);

  /** Press a note key: the note plays for as long as it is held. */
  const noteDown = useCallback(
    (idx: number) => {
      const note = NOTES[idx];
      downAtRef.current.set(idx, Date.now());
      startTone(idx, note.freq);
      speak(note.name.replace("′", ""));
      setActiveNote(idx);
      setDisplay({
        big: note.name,
        sub: `${note.western} · sing it: ${note.name}!`,
        emoji: "🎵",
        color: note.color,
        stamp: Date.now(),
      });
    },
    [startTone, speak],
  );

  /** Release a note key: keep a short minimum ring for quick taps, then stop. */
  const noteUp = useCallback(
    (idx: number) => {
      const downAt = downAtRef.current.get(idx) ?? Date.now();
      const held = Date.now() - downAt;
      const wait = Math.max(0, 380 - held);
      timers.current.push(
        setTimeout(() => {
          stopTone(idx);
          setActiveNote((a) => (a === idx ? null : a));
        }, wait),
      );
    },
    [stopTone],
  );

  // Computer keyboard: hold A S D F G H J K to play; the note stops when the key is released.
  // Esc stops everything — song, held notes, and voice.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopSong();
        try { window.speechSynthesis.cancel(); } catch { /* noop */ }
        return;
      }
      if (mode !== "sargam" && mode !== "piano") return;
      if (e.repeat) return;
      const idx = NOTES.findIndex((n) => n.keyboard === e.key.toLowerCase());
      if (idx >= 0) noteDown(idx);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const idx = NOTES.findIndex((n) => n.keyboard === e.key.toLowerCase());
      if (idx >= 0) stopTone(idx);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, noteDown, stopTone, stopSong]);

  function playSong(song: number[], label: string) {
    stopSong();
    setPlaying(true);
    speak(label);
    song.forEach((noteIdx, i) => {
      timers.current.push(
        setTimeout(() => {
          const note = NOTES[noteIdx];
          playTone(note.freq, 0.7);
          setActiveNote(noteIdx);
          setDisplay({
            big: note.name,
            sub: label,
            emoji: "🎶",
            color: note.color,
            stamp: Date.now(),
          });
          if (i === song.length - 1) {
            timers.current.push(
              setTimeout(() => {
                setPlaying(false);
                setActiveNote(null);
              }, 500),
            );
          }
        }, 500 * (i + 1)),
      );
    });
  }

  function tapLetter(i: number) {
    const card = LETTERS[i];
    setDisplay({
      big: card.letter,
      sub: `${card.letter} for ${card.word}!`,
      emoji: card.emoji,
      color: card.color,
      stamp: Date.now(),
    });
    playTone(NOTES[i % NOTES.length].freq, 0.5);
    speak(`${card.letter}! ${card.letter} for ${card.word}!`);
  }

  function tapNumber(n: number) {
    const word = NUMBER_WORDS[n - 1];
    setDisplay({
      big: String(n),
      sub: `${word}! Count the stars!`,
      color: NUMBER_COLORS[n - 1],
      stars: n,
      stamp: Date.now(),
    });
    playTone(NOTES[(n - 1) % NOTES.length].freq, 0.5);
    if (n <= 10) {
      const count = Array.from({ length: n }, (_, i) => i + 1).join(", ");
      speak(`${word}! ${count}!`);
    } else {
      speak(`${word}!`);
    }
  }

  function switchMode(m: Mode) {
    stopSong();
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setMode(m);
    setDisplay({
      big: m === "abc" ? "Aa" : m === "num" ? "123" : m === "sargam" ? "Sa" : "🎹",
      sub:
        m === "abc"
          ? "Tap a letter!"
          : m === "num"
            ? "Tap a number!"
            : m === "sargam"
              ? "Tap the notes — Sa Re Ga Ma!"
              : "Play the piano!",
      color: "bg-yellow-300",
      stamp: Date.now(),
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-sky-100 px-4 py-6 text-stone-900">
      <header className="mx-auto mb-5 max-w-4xl text-center">
        <h1 className="animate-floaty text-4xl font-black tracking-tight sm:text-5xl">
          🌈 KidsPlay 🎈
        </h1>
        <p className="mt-2 text-base font-semibold text-stone-600">
          ABC · 123 · Sa Re Ga Ma · Piano — tap, listen, sing, play!
        </p>
      </header>

      {/* Big display */}
      <div className="mx-auto max-w-4xl">
        <div
          key={display.stamp}
          className={`animate-pop flex min-h-[190px] flex-col items-center justify-center rounded-[2rem] border-4 border-white shadow-xl ${display.color} px-4 py-5 text-center`}
        >
          <div className="text-7xl font-black drop-shadow-sm sm:text-8xl">
            {display.emoji ? `${display.emoji} ` : ""}
            {display.big}
          </div>
          <div className="mt-1 text-2xl font-extrabold">{display.sub}</div>
          {display.stars ? (
            <div className="mt-2 max-w-md text-2xl leading-snug">
              {Array.from({ length: display.stars }, () => "⭐").join(" ")}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mode tabs */}
      <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`rounded-full px-5 py-3 text-lg font-extrabold shadow-md transition active:scale-95 ${
              mode === m.id ? "bg-stone-900 text-white" : "bg-white text-stone-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-4xl pb-10">
        {mode === "abc" && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7">
            {LETTERS.map((card, i) => (
              <button
                key={card.letter}
                onPointerDown={() => tapLetter(i)}
                className={`${card.color} rounded-3xl border-b-8 border-black/15 py-4 text-3xl font-black text-white shadow-md transition hover:scale-105 active:scale-95`}
              >
                {card.letter}
                <span className="block text-xl">{card.emoji}</span>
              </button>
            ))}
          </div>
        )}

        {mode === "num" && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {NUMBER_WORDS.map((_, i) => (
              <button
                key={i}
                onPointerDown={() => tapNumber(i + 1)}
                className={`${NUMBER_COLORS[i]} rounded-3xl border-b-8 border-black/15 py-5 text-4xl font-black text-white shadow-md transition hover:scale-105 active:scale-95`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {(mode === "sargam" || mode === "piano") && (
          <div>
            {mode === "sargam" && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => playSong(SCALE_SONG, "Sa Re Ga Ma Pa Dha Ni Sa!")}
                  disabled={playing}
                  className="rounded-full bg-stone-900 px-5 py-3 text-base font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  ▶ Play the scale
                </button>
                <button
                  onClick={() => playSong(TWINKLE, "Twinkle twinkle little star!")}
                  disabled={playing}
                  className="rounded-full bg-white px-5 py-3 text-base font-extrabold text-stone-800 shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  🎵 Twinkle Twinkle
                </button>
                {playing && (
                  <button
                    onClick={stopSong}
                    className="rounded-full bg-red-500 px-5 py-3 text-base font-extrabold text-white shadow-md transition active:scale-95"
                  >
                    ⏹ Stop
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-1.5 sm:gap-2">
              {NOTES.map((note, i) => (
                <button
                  key={note.name}
                  onPointerDown={() => noteDown(i)}
                  onPointerUp={() => noteUp(i)}
                  onPointerLeave={() => noteUp(i)}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`flex h-52 flex-1 flex-col items-center justify-end rounded-b-3xl border-b-8 border-black/20 pb-4 shadow-md transition sm:h-64 ${
                    note.color
                  } ${activeNote === i ? "scale-[1.03] brightness-110 ring-4 ring-white" : ""} active:scale-95`}
                >
                  <span className="text-xl font-black text-white drop-shadow sm:text-2xl">
                    {mode === "piano" ? note.western : note.name}
                  </span>
                  <span className="text-xs font-bold text-white/90">
                    {mode === "piano" ? note.name : note.western}
                  </span>
                  <span className="mt-1 hidden rounded bg-black/20 px-1.5 text-[10px] font-bold text-white sm:block">
                    key {note.keyboard.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-stone-500">
              Tap a key — or hold it (or hold A S D F G H J K) to keep the note playing 🎹 · Press{" "}
              <span className="rounded bg-stone-800 px-1.5 py-0.5 text-white">Esc</span> to stop all sound
            </p>
          </div>
        )}
      </div>

      <footer className="pb-4 text-center text-xs font-medium text-stone-400">
        KidsPlay — free forever, no ads, no sign-up. Sounds and voices are made right in your browser.
      </footer>
    </main>
  );
}

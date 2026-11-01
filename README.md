# KidsPlay 🌈 — ABC, 123, Sa Re Ga Ma & Piano for Toddlers

A free play-and-learn app for toddlers and preschoolers. Big colorful buttons, real sounds, and a friendly voice — everything happens right in the browser. No ads, no sign-up, no downloads.

Built with **Next.js + TypeScript**. Sounds are synthesized live with the Web Audio API and voices use the browser's speech engine — zero audio files, zero API keys.

## The four play modes

- **🔤 ABC** — all 26 letters, A to Z. Tap a letter and it pops big on screen with its picture word ("A for Apple! 🍎") and says it out loud.
- **🔢 123** — numbers 1 to 20. Tap a number to see it big, watch that many stars appear, and hear it counted out loud ("Three! 1, 2, 3!").
- **🎶 Sa Re Ga Ma** — the Indian classical sargam scale as big playable keys: Sa Re Ga Ma Pa Dha Ni Sa′. Every key plays its real note. Buttons auto-play the full scale and *Twinkle Twinkle Little Star*.
- **🎹 Piano** — a rainbow piano (C D E F G A B C′) with the sargam name under every key, so kids connect both systems. On a computer, keys **A S D F G H J K** play too.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000 — then hand the phone/tablet to a toddler
```

## How it works

- **Music:** Web Audio API oscillators (triangle + harmonic) tuned to equal temperament from C4 — Sa = C, Re = D, Ga = E, Ma = F, Pa = G, Dha = A, Ni = B, Sa′ = C5.
- **Voice:** the Web Speech API (`speechSynthesis`) with a slightly higher pitch for a friendly feel. No recordings needed, and it works offline in most browsers after first load.
- **Design:** oversized tap targets, bright colors, pop animations — built for small hands and short attention spans. Everything is one static page, so it hosts anywhere.

## Ideas to add next

- Animal sounds mode (tap the animal, hear its name and sound)
- Telugu/Hindi alphabet mode alongside ABC
- "Repeat after me" game: the app plays 2–3 notes, the child plays them back
- Shapes & colors mode with the same tap-and-hear pattern

## License

MIT

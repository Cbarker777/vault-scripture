# CLAUDE.md — VAULT SCRIPTURE

Project spec and working agreement for Claude Code. Read this before touching code.

---

## 1. What this is

A single-user, self-hosted, offline-first web app that turns Bible reading into a
retro-terminal RPG. The user reads a chapter, the terminal awards XP, drops gear,
advances questlines, and tracks stats. Runs on a LAN box (Unraid via Docker) and
wraps to Android via Capacitor from the same codebase.

**Non-goals.** No accounts, no cloud sync, no social feed, no leaderboard, no
multiplayer, no ads, no in-app purchases, no external API calls at runtime. If a
feature requires a network round trip to work, it is out of scope.

**Single design constraint that outranks everything else:** the progression system
must never reward reading *faster*. See §6.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite | TypeScript, strict mode on |
| Styling | Tailwind + a small hand-written CSS layer | CRT effects need real CSS, not utilities |
| State | Zustand | One store per domain: `reader`, `progression`, `inventory` |
| Persistence | SQLite via `sql.js` + IndexedDB (browser) / better-sqlite3 (server) | Abstract behind `src/db/adapter.ts` so both targets share the API |
| Bible text | Bundled JSON, World English Bible (WEB) | Public domain. KJV/ASV as swappable data packs |
| Packaging | Docker (nginx serving static build) + Capacitor for Android | |
| Testing | Vitest + Testing Library | Progression math must have unit tests |

Do not add a state library, UI kit, animation library, or component framework
beyond the above without asking. No Redux, no MUI, no shadcn, no Framer Motion.

---

## 3. Bible data

Source WEB as one JSON file per book: `src/data/bible/{bookId}.json`

```ts
type Book = {
  id: string;            // "gen", "psa", "1co"
  name: string;          // "Genesis"
  testament: "OT" | "NT";
  genre: BookGenre;      // drives which stat gets XP — see §5
  chapters: Chapter[];
};

type Chapter = {
  number: number;
  verses: { number: number; text: string }[];
  wordCount: number;     // precomputed at build time, not runtime
};
```

Write a build script (`scripts/ingest-bible.ts`) that pulls the WEB source, splits
by book, precomputes `wordCount`, and writes the JSON. Commit the output — the app
never fetches text at runtime.

---

## 4. Data model

```ts
type Profile = {
  level: number;
  xp: number;              // lifetime
  caps: number;            // spendable currency
  stats: Record<StatId, number>;  // 1–10 each
  createdAt: string;
};

type ReadingSession = {
  id: string;
  bookId: string;
  chapter: number;
  startedAt: string;
  endedAt: string;
  dwellSeconds: number;    // active, not wall clock — see §6
  reflection: string | null;
  comprehensionPassed: boolean | null;
  xpAwarded: number;
  verified: boolean;
};

type InventoryItem = {
  id: string;
  defId: string;           // FK into item definitions
  acquiredAt: string;
  equipped: boolean;
};

type Quest = {
  bookId: string;          // one questline per book
  chaptersRead: number[];
  completedAt: string | null;
};
```

Migrations live in `src/db/migrations/` numbered `001_*.sql`. Never edit a shipped
migration; add a new one.

---

## 5. Stats and progression

Six stats, replacing S.P.E.C.I.A.L. Each starts at 1, caps at 10. Reading a chapter
raises the stat tied to that book's genre.

| Stat | Genre that feeds it | Books |
|---|---|---|
| **Endurance** | Law | Genesis–Deuteronomy |
| **Valor** | History | Joshua–Esther |
| **Insight** | Wisdom | Job–Song of Songs |
| **Vision** | Prophecy | Isaiah–Malachi, Revelation |
| **Witness** | Gospel/Acts | Matthew–Acts |
| **Charity** | Epistle | Romans–Jude |

A stat goes up one point every N chapters of its genre, where N scales so that
maxing a stat requires reading roughly its whole genre. Compute N per genre at
build time from actual chapter counts; do not hardcode.

**Level curve.** `xpForLevel(n) = 100 * n^1.5`, rounded. Level 1→2 costs 100,
10→11 costs ~3,162. Tune the exponent in one constant, `LEVEL_EXPONENT`.

**Perks.** One perk pick per level. Perks modify the loop, not the numbers:
- *Marginalia* — reflection notes get a rich-text editor and are searchable
- *Concordance* — cross-references appear inline in the reader
- *Night Shift* — reading between 2200–0500 gets a small XP bonus
- *Cartographer* — unlocks the map view for narrative books
- *Lectionary* — a daily assigned chapter with bonus caps

Store perk definitions as data in `src/data/perks.ts`, not as branching code.

---

## 6. XP: the anti-grind rules

This is the part to get right. Read it twice.

A session awards XP **only if it is verified.** Verification requires all three:

1. **Dwell time** ≥ `wordCount / 240 * 60` seconds (i.e. 240 wpm ceiling). Dwell is
   *active* time — pause the timer on tab blur, on window blur, and after 90
   seconds with no scroll or interaction.
2. **Scroll completion** — the last verse element has intersected the viewport.
3. **One of:** a reflection note of ≥ 15 words, OR passing a 3-question
   comprehension check.

Unverified sessions are still logged and still count toward the reading history and
questline progress — they just award 0 XP. Never delete a session; never scold the
user for one. The empty state for an unverified read reads: *"Logged. No XP —
verification incomplete."*

**Award formula:**

```
baseXP   = ceil(wordCount / 25)
depthMul = 1.0 + min(dwellSeconds / expectedSeconds - 1, 1.0) * 0.5   // caps at 1.5x
firstMul = firstTimeReadingThisChapter ? 1.5 : 1.0
xp       = round(baseXP * depthMul * firstMul)
```

Note the shape: **slower reading pays more, up to 2x expected time.** Past 2x it
stops paying, so idling on a page is worthless. Rereads pay less than first reads,
so grinding one short chapter is worthless. There is no daily XP cap and no streak
multiplier on XP — streaks pay caps only.

**Comprehension checks.** Generate them at build time, not runtime — no live model
calls. Ship a `questions.json` per book with 3–5 factual recall questions per
chapter (who/where/what happened, never interpretive or doctrinal). If a chapter
has no authored questions, fall back to the reflection-note path silently.

---

## 7. Loot

Items are cosmetic and utility, never a power ladder — nothing that gates content
or multiplies XP.

- **Tiers:** Common / Marked / Rare / Relic, with drop weights 60/25/12/3
- **Drop triggers:** chapter completion (single roll), book completion (guaranteed
  Rare+), streak milestones at 7/30/100 days
- **Categories:** terminal themes (phosphor color, scanline density, boot text),
  reader typefaces, holotape audio stings, desk objects for the stash screen, and
  bookmark designs
- **Caps** buy rerolls on the drop table and unlock cosmetic slots. Caps are earned
  from streaks and questline completion, not from XP.

Item definitions live in `src/data/items.ts` as flat data with a `slot`, `tier`,
`name`, `flavor`, and `apply` key that maps to a CSS variable set. No item should
require new rendering code.

---

## 8. Quests

- **Questline = one book.** Progress bar = chapters read at least once.
- **Bounties = daily.** One assigned chapter, expires at local midnight, pays caps.
- **Missions = reading plans.** Ship three: Chronological, New Testament in 90,
  Psalms & Proverbs Daily. Plans are data files listing `{day, readings[]}`.
- Completing a questline mints a **Relic** and a stash-shelf trophy.

---

## 9. Interface

**Direction:** a Cold-War-era archival terminal in a records vault — not a Pip-Boy
strapped to a wrist. The device is a desk, not a gauntlet. Fewer curves, more
metal. The conceit is that you are the last archivist reading the last copy.

**Tokens** (define once in `src/styles/tokens.css`, derive everything from these):

```
--phosphor:      #3ee66b   /* primary text, P1 green */
--phosphor-dim:  #1f7a3a   /* inactive, labels */
--amber:         #ffb000   /* warnings, caps, streak */
--bone:          #ded6c3   /* reading text only — see below */
--vault:         #0a0d0a   /* background */
--rust:          #8a3a24   /* destructive, expired bounties */
```

**Typography.**
- Chrome, menus, stats, all UI: `Berkeley Mono` or fallback `IBM Plex Mono`, and
  it should look typed — letterspacing `0.05em`, uppercase for labels only.
- **Scripture itself does not render in monospace.** Set the reading pane in a
  serif (`Cormorant Garamond` or `EB Garamond`), 19px, 1.75 line-height, measure
  capped at 68 characters, in `--bone` rather than phosphor green.

That contrast *is the signature element*: the machine is green and typed, the text
it holds is warm and printed. The reader pane should feel like it belongs to a
different, older object than the frame around it. Everything else stays quiet.

**Motion.**
- One orchestrated moment: a boot sequence on cold start — memory check, vault ID,
  scripture pack version, then the menu. Runs once per session, skippable on any
  keypress, never shown twice in an hour.
- Scanlines and a faint flicker on the chrome. **None on the reading pane** — it
  must be genuinely comfortable for 20 minutes.
- Level-up: the terminal "retunes." Screen desaturates for 400ms, stat line
  rewrites character by character. No confetti, no modal, no sound by default.
- Respect `prefers-reduced-motion` — kill boot sequence, flicker, and typewriter.

**Copy.** Terminal voice, never cute, never devotional-greeting-card. Buttons say
what happens: `LOG SESSION`, not `Submit`. Errors state fact and remedy:
`NO SCRIPTURE PACK LOADED — run pack install`. Empty stash reads
`STASH EMPTY — complete a chapter to pull a drop`. Do not write copy that praises
the user for reading.

**Screens.** Terminal (home/menu) · Reader · Stats · Stash · Quests · Archive
(session history + reflections, searchable).

---

## 10. Build order

Ship each phase working before starting the next. Do not scaffold ahead.

1. Bible ingest script + reader pane. Navigation, chapter selection, persistence of
   which chapter you're on. No game layer at all.
2. Session tracking: dwell timer with blur/idle pause, scroll completion, reflection
   input. Log sessions to SQLite. Still no XP.
3. Progression: XP formula, level curve, stats, unit tests on the math.
4. Terminal shell: boot sequence, menus, tokens, typography split.
5. Quests + bounties + reading plans.
6. Loot, stash, caps, perks.
7. Docker build for Unraid. Then Capacitor Android wrap.

---

## 11. Working agreement

- TypeScript strict. No `any` outside `src/db/adapter.ts`.
- Progression math lives in `src/progression/` as pure functions with no React or
  DB imports. It must be testable in isolation and it must have tests.
- Content (books, items, perks, plans, questions) is **data**, never code branches.
  Adding an item or a perk should require zero changes to components.
- Do not add analytics, telemetry, crash reporting, or any outbound request.
- Do not generate, paraphrase, or alter scripture text. Render the pack verbatim.
- Comprehension questions are factual recall only. Never doctrinal, never
  interpretive, never a quiz on what a passage "means."
- Commit per phase with a working build. Run `npm test` before each commit.

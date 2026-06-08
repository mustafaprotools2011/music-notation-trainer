# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `index.html` directly in a browser — no build step, no server, no dependencies to install. The app is entirely self-contained.

## Architecture

A zero-dependency, single-page Arabic music notation trainer for classroom use. Three files only:

- **`index.html`** — static shell; the `<svg id="notationCanvas">` element is a placeholder that gets fully replaced at runtime via `outerHTML`.
- **`app.js`** — all application logic in a single flat file, organized by clearly commented sections.
- **`styles.css`** — all styles, including SVG notation element classes (`.note-head`, `.stem`, `.ledger-line`, etc.).

### Key patterns in `app.js`

**Pitch-to-coordinate system:** `pitchToY(step)` converts a diatonic step integer to an SVG y-position. `step=0` is E4 (bottom treble staff line = y 176), steps increase upward, each step = 12px (half a staff space). Bass clef notes reuse the same formula but their `step` values are defined relative to G2.

**SVG rendering:** All drawing functions (`drawNoteOnTrebleStaff`, `drawRhythm`, `drawInterval`, etc.) return full SVG strings. `setCanvas(svgHTML)` injects them via `canvas.outerHTML`, which detaches the old element — there is no live `canvas` reference after a `setCanvas` call.

**State:** A single `state` object holds `moduleId`, `activeTab`, and `score`. Score is persisted to `localStorage` under the key `notationScore_v2`.

**Question flow:** `newQuestion()` picks a random item from the relevant bank (`trebleNotes`/`bassNotes`, `rhythmBank`, etc.), renders the SVG, then calls `setAnswers(correct, distractors, explanation)` which shuffles one correct answer with 3 randomly chosen distractors.

**Modules:** Six modules — `notes`, `rhythm`, `accidentals`, `scales`, `intervals`, `terms` — each defined in the `modules` array (metadata + UI text) with a matching key in `references` (the quick-reference table data) and a corresponding question bank array.

## Content Reference

| Module | Question bank | Notes |
|---|---|---|
| `notes` | `trebleNotes` (C4–F5), `bassNotes` (G2–A3) | 50/50 treble/bass coin-flip per question |
| `rhythm` | `rhythmBank` | Whole / Half / Quarter / Eighth |
| `accidentals` | `accidentalsBank` | ♯ ♭ ♮ |
| `scales` | `scalesBank` | Major, Natural minor, Harmonic minor, Chromatic |
| `intervals` | `intervalsBank` | M2–m7, all from C as lower note |
| `terms` | `termsBank` | Tempo, dynamics, articulation terms |

## Styling Notes

CSS custom properties (on `:root`) define the full color palette — `--accent` (#126b61 teal), `--gold` (#c68922), `--rose` (#b6465f). SVG element appearance is controlled entirely through CSS classes (`.note-head`, `.note-open`, `.stem`, `.clef`, `.accidental`, `.soft-label`) rather than inline SVG attributes.

Layout is a two-column CSS Grid (`sidebar` 290px + `workspace`), collapsing to single-column below 980px.

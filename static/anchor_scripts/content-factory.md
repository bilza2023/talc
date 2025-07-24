`p-p`

Here is your **Final Draft Spec** for the project:

---

# ✅ Project: **Deck Tester (Local Studio)**

A minimal, offline-friendly, browser-based deck testing tool with persistent deck memory and in-memory assets.

---

## 🧱 Architecture Summary

* No backend
* No database
* Runs in browser
* Saves `deck.js` to `localStorage`
* Keeps narration + images in memory
* 3 simple pages: Upload → Play → Timing

---

## 📄 Pages Overview

### I. `/upload` — **Deck Upload Page**

**Features:**

I. Upload `deck.js`
II. Upload `audio.mp3` (full narration)
III. Upload **multiple images** via drag/drop or file input
IV. Save `deck.js` in `localStorage.deck`
V. Save image URLs in memory:

```js
imageMap[filename] = URL.createObjectURL(file)
```

VI. Save narration via:

```js
audioUrl = URL.createObjectURL(audioFile)
```

**Actions:**

* ✅ “Start Testing” → go to `/play`
* 🔁 “Restore Last Deck” → preload from `localStorage`
* ❌ “Reset” → clear `localStorage`

---

### II. `/play` — **Playback Page**

**Features:**

I. Load `deck.js` from `localStorage`
II. Use `Player.js` to:

* Play `audioUrl`
* Tick at intervals
* Match current time to slide
  III. Render slides using deck
* Images linked by filename → pulled from `imageMap`

**Extras (Optional):**

* Show progress bar / tick time
* Manual slide navigation
* Slide index viewer

---

### III. `/timing` — **Timing Adjustment Page**

**Features:**

I. Slide list with input fields for:

* `startTime`
* `duration` (optional)
  II. Simple waveform or audio progress bar (optional)
  III. Update `deck.slides[].start` inline
  IV. On change: update `localStorage.deck` live

**Actions:**

* 🔁 Re-preview in `/play`
* ✅ Export updated `deck.js` (optional)
* ❌ Reset timings

---

## 🗂 Runtime Storage Strategy

| Asset     | Where stored         | How                     |
| --------- | -------------------- | ----------------------- |
| `deck.js` | `localStorage.deck`  | `JSON.stringify()`      |
| images    | `imageMap[fileName]` | `URL.createObjectURL()` |
| narration | `audioUrl`           | `URL.createObjectURL()` |

---

## 🧰 Tools / Components Needed

I. `DeckUploader.svelte`
II. `PlayerPreview.svelte` (uses `Player.js`)
III. `TimingEditor.svelte`
IV. `DeckStorage.js` (handles localStorage logic)
V. `AssetMap.js` (in-memory images/audio cache)

---

## 🔧 Deployment

I. Local: run with `vite dev`
II. Portable: build with Vite → run with Docker:

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npx", "serve", "dist"]
```

---

This system is lightweight, fully local, and aligned with your workflow goals.
Let me know if you want the initial file structure scaffold or the code-mode next.

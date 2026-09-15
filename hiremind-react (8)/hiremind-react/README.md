# HireMind AI — React frontend

This is a React (Vite) port of your original vanilla HTML/JS/CSS frontend.
It talks to the **same FastAPI backend** you already have running at
`http://localhost:8000` — no backend changes needed, just swap which
frontend you run.

Same design system (colors, fonts, "departure board" theme), same features
(login/register, candidate resume/jobs/applications/assessments/interviews,
recruiter analytics/post-job/kanban pipeline with drag-and-drop, admin
overview/users/jobs) — rebuilt as real React components with routing,
instead of one big HTML file with `document.getElementById` calls everywhere.

---

## 1. Folder structure

```
hiremind-react/
├── index.html                  # Vite entry HTML (just a <div id="root">)
├── package.json                # dependencies + npm scripts
├── vite.config.js              # dev server runs on port 5500
├── src/
│   ├── main.jsx                 # React entry point — mounts <App/>
│   ├── App.jsx                  # all routes live here (react-router-dom)
│   ├── api.js                   # fetch wrapper + auth helpers (same logic as old api.js)
│   ├── styles.css               # your exact CSS, unchanged
│   │
│   ├── context/
│   │   ├── AuthContext.jsx       # replaces old requireAuth()/localStorage pattern
│   │   └── ToastContext.jsx      # replaces old toast() global function
│   │
│   ├── components/               # small reusable pieces used across pages
│   │   ├── Sidebar.jsx            # generic sidebar nav (used by all 3 dashboards)
│   │   ├── NotificationBell.jsx   # the 🔔 dropdown
│   │   ├── ScoreRing.jsx          # animated SVG match-score ring
│   │   ├── Odometer.jsx           # animated count-up number (admin stats)
│   │   ├── ChartCanvas.jsx        # thin Chart.js wrapper
│   │   ├── SkillTags.jsx          # renders a list of skill pills
│   │   ├── Modal.jsx              # generic modal dialog
│   │   └── ProtectedRoute.jsx     # redirects if not logged in / wrong role
│   │
│   └── pages/
│       ├── Login.jsx              # login/register split-screen (was index.html)
│       │
│       ├── candidate/
│       │   ├── CandidateLayout.jsx  # sidebar + <Outlet/> for candidate routes
│       │   ├── Resume.jsx           # was "My Resume" section
│       │   ├── Jobs.jsx             # was "Browse Jobs" section
│       │   ├── Applications.jsx     # was "My Applications" section
│       │   ├── Assessments.jsx      # was "Assessments" section
│       │   └── Interviews.jsx       # was "Interviews" section
│       │
│       ├── recruiter/
│       │   ├── RecruiterLayout.jsx
│       │   ├── Analytics.jsx        # was "Analytics" section
│       │   ├── PostJob.jsx          # was "Post a Job" section
│       │   └── Pipeline.jsx         # was "Jobs & Pipeline" — kanban + all 3 modals
│       │
│       └── admin/
│           ├── AdminLayout.jsx
│           ├── Overview.jsx         # was "Platform Overview"
│           ├── Users.jsx            # was "Users" (search/sort/filter table)
│           └── AllJobs.jsx          # was "All Jobs"
```

**Why this structure?** Each "page" in your old app (Resume, Jobs, Applications,
etc.) is now its own file instead of a `<div id="secX">` toggled with
JavaScript. React Router (`react-router-dom`) handles switching between them
based on the URL — e.g. going to `/candidate/jobs` automatically shows
`Jobs.jsx` inside `CandidateLayout.jsx`'s sidebar, and the correct sidebar
item gets highlighted automatically (no more manually toggling `.active`
classes).

---

## 2. Commands to run it

You need **Node.js 18+** installed (same requirement as before, if you've
used `npm` at all you already have this). Open a terminal:

```bash
# 1. Go into the project folder
cd hiremind-react

# 2. Install dependencies (only needed once, or whenever package.json changes)
npm install

# 3. Start the dev server
npm run dev
```

You'll see something like:
```
  VITE v5.x.x  ready in 400 ms

  ➜  Local:   http://localhost:5500/
```

Open `http://localhost:5500` in your browser. That's it — Vite auto-reloads
the page whenever you save a file.

**Your backend must also be running**, exactly like before:
```bash
cd backend
.\venv\Scripts\Activate.ps1      # Windows PowerShell — or source venv/bin/activate on Mac/Linux
python run.py
```

The React app talks to `http://localhost:8000/api` (see `src/api.js`,
`API_BASE` constant) — same backend, same endpoints, nothing to change there.

---

## 3. Building for production (optional)

If you ever want a static build (e.g. to deploy somewhere instead of running
the dev server):

```bash
npm run build      # outputs to dist/
npm run preview    # serves the built version locally to sanity-check it
```

---

## 4. What's different from the old vanilla version (for your understanding)

| Old (vanilla JS) | New (React) |
|---|---|
| One `.html` file per role, `<div>`s toggled with `classList.toggle('hidden')` | One `.jsx` file per "page", React Router switches between them by URL |
| `document.getElementById(...).innerHTML = '...'` to update the page | `useState` holds data, JSX re-renders automatically when it changes |
| Global `toast()` function appending to a `<div class="toast-stack">` | `useToast()` hook from `ToastContext` — same visual result |
| `requireAuth('candidate')` redirecting via `window.location.href` | `<ProtectedRoute role="candidate">` wrapping routes in `App.jsx` |
| Kanban drag-and-drop via `ondragstart`/`ondrop` HTML attributes | Same native HTML5 drag events, just wired through React's `onDragStart`/`onDrop` props instead |
| Chart.js created manually in `document.getElementById('stageChart')` | `<ChartCanvas config={...} />` component wraps the same Chart.js calls |

The CSS file (`src/styles.css`) is **byte-for-byte your original CSS** —
class names like `.card`, `.kanban-card`, `.status-pill` etc. all work
exactly the same, since React just outputs the same HTML with the same
`className` attributes.

---

## 5. If something doesn't work

- **Blank page / console errors about "Cannot find module 'react'"** — you
  skipped `npm install`. Run it inside the `hiremind-react` folder.
- **"Failed to fetch" on every page** — same as before, this means the
  backend isn't running. Start it with `python run.py` in a separate terminal.
- **Port 5500 already in use** — you probably still have the old Python
  `http.server` running from before. Stop that (Ctrl+C in its terminal) or
  change the port in `vite.config.js`.
- **Login works but immediately redirects back to login** — check that
  `src/api.js`'s `API_BASE` matches where your backend is actually running
  (`http://localhost:8000/api` by default).

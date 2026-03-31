# RepoWeb Project Documentation

## 1. What This Project Is
RepoWeb is a full-stack web application that helps schools generate report cards from uploaded subject score files.  
It removes manual spreadsheet work by handling:

- score aggregation
- weighted final-score calculation
- per-subject ranking
- overall student ranking
- PDF report card generation (multiple visual templates)
- batch export (compiled PDF + ZIP of all student PDFs)

The project is built with:

- Frontend: HTML + CSS + Vanilla JavaScript
- Backend: Python + Flask
- Data processing: pandas
- PDF generation: reportlab + pypdf
- Image handling: Pillow (PIL)

---

## 2. How The App Is Structured

### Key files
- `static/index.html`: main generator page (the app workflow)
- `static/about.html`: about/story/team page
- `static/styles.css`: shared styling for both pages
- `static/app.js`: frontend behavior for form logic, palette controls, uploads, API calls, and rendering results
- `app.py`: Flask backend (routes, validation, score processing, ranking, PDF rendering, download endpoints)
- `node-tools/`: optional Node.js side module for lightweight score/ranking data-manipulation utilities

### Presentation framing (recommended)
When presenting this project, you can describe it like this:

- “We built a frontend client and a backend API service.”
- “The frontend consumes our API endpoints (`/api/template`, `/api/generate`, `/api/download/...`).”
- “The backend is a separate service layer implemented in Python.”

This framing is strong because it matches how modern web systems are designed: UI client + API service.

### Runtime flow (high-level)
1. User opens `/` and fills the generator form.
2. Frontend sends a `POST` request to `/api/generate` with form fields + subject files + optional logo.
3. Backend validates data, aggregates scores, computes rankings, and generates one PDF per student.
4. Backend also creates:
   - a compiled PDF of all students
   - a ZIP containing compiled + individual PDFs
5. Frontend receives JSON response and shows download links/results.

---

## 3. Page 1: `index.html` (Generator Page)

## 3.1 Main layout blocks
The page is built around:

- background glow layers:
  - `<div class="glow glow-a"></div>`
  - `<div class="glow glow-b"></div>`
- main container:
  - `<main class="page"> ... </main>`

Inside `main.page`, the app uses repeated card sections with:

- `<section class="hero reveal">` for intro/header
- `<section class="panel reveal">` for each workflow step
- `<form id="generator-form" class="wizard-form">` for input flow

### Workflow sections in the page
1. Download template (`#download-template-btn`)
2. School and score config (form grid inputs)
3. PDF template choice (`.template-grid` + `.template-card`)
4. Color system controls (`.color-lab`, color pickers, hex inputs, random button)
5. Logo settings (`#school-logo`, `#logo-style`, `#logo-opacity`)
6. Subject file upload + generate button
7. Results panel (`#results`) with compiled PDF, ZIP, and per-student links

### Important IDs/classes used by JavaScript
- form/data:
  - `#generator-form`, `#subject-files`, `#generate-btn`, `#status`
- template UI:
  - `.template-card`, `input[name="template_id"]`
- color UI:
  - `#primary-color-input`, `#primary-color-hex`
  - `#secondary-color-input`, `#secondary-color-hex`
  - `#surface-color-input`, `#surface-color-hex`
  - `#random-palette-btn`
- logo UI:
  - `#school-logo`, `#logo-style`, `#logo-opacity-row`, `#logo-opacity`
  - `#logo-preview-wrap`, `#logo-preview`, `#logo-meta`
- results UI:
  - `#results`, `#compiled-link`, `#zip-link`, `#summary`, `#student-links`, `#warnings`

---

## 4. Page 2: `about.html` (About/Team Page)

This page reuses the same visual system and structure patterns as `index.html`.

### Main layout blocks
- same glow background layers (`.glow-a`, `.glow-b`)
- `<main class="page">`
- top hero section (`.hero.reveal`)
- content panels (`.panel.reveal`)

### About page content sections
- **Hero**:
  - eyebrow text
  - `.about-hero-row` with `<h1>` and a back link button (`.btn.btn-ghost.btn-hero-about`)
- **Origin Story panel**:
  - `.story-copy` paragraph block
- **Meet the Makers panel**:
  - `.makers-grid` (unordered list)
  - each person is an `<a class="maker-link">`
  - `.about-actions` includes a return-to-generator button

### Why this matters
Even though this is a simpler page, it follows the same design language (hero, panel, buttons, reveal animation, typography), so both pages feel like one product and not two disconnected pages.

---

## 5. Theme And Multicolored Backgrounds

## 5.1 Theme tokens (CSS variables)
In `styles.css`, `:root` defines design tokens like:

- `--bg`, `--bg-deep` (page background tones)
- `--ink`, `--ink-soft` (text colors)
- `--panel`, `--line` (card/background borders)
- `--brand`, `--brand-2`, `--accent` (brand colors)
- `--radius` (corner radius)

This creates a centralized style system where many components share the same palette values.

## 5.2 Multicolored page background implementation
The body background is layered with gradients:

- radial gradient at top-left (cool tint)
- radial gradient at top-right (warm tint)
- base diagonal linear gradient

Then two fixed blurred circles are added:

- `.glow-a` (green/cyan glow)
- `.glow-b` (gold/orange glow)

Those glow layers are:
- fixed-position
- heavily blurred
- partially transparent
- behind content (`z-index: -1`)

This combination gives the pages that soft multi-color atmospheric look.

## 5.3 Component-level color treatment
- hero cards use strong brand gradients
- panels use translucent backgrounds + `backdrop-filter: blur(...)`
- buttons use gradient fills for priority actions and lighter ghost styles for secondary actions
- form and card borders use subtle alpha lines to preserve depth without noise

## 5.4 Dynamic theme interaction (frontend + backend)
- Frontend color pickers allow user-selected `primary`, `secondary`, and `surface` colors.
- `app.js` normalizes colors and syncs picker + hex fields.
- `applyPalette()` updates CSS variable `--brand` live for immediate UI feedback.
- Those selected colors are also posted to backend and applied in generated PDFs (`theme_primary`, `theme_secondary`, `theme_surface`).

So the UI and output documents stay visually aligned around the same theme idea.

---

## 6. Frontend Behavior (`static/app.js`)

Main responsibilities:

- validate scoring percentages (`ClassScore% + ExamScore% = 100`)
- preview selected files and logo
- manage template card selected state
- sync color picker and hex inputs
- random palette generation (HSL to HEX conversion)
- show/hide watermark strength control when logo style is `watermark`
- submit form with `fetch("/api/generate", { method: "POST", body: formData })`
- render response details:
  - summary text
  - compiled/ZIP links
  - per-student download links
  - warning messages

---

## 7. Backend Logic (`app.py`)

## 7.1 API and page routes
- `GET /` -> serves `index.html`
- `GET /about` -> serves `about.html`
- `GET /api/template` -> downloadable Excel template
- `POST /api/generate` -> generates all report outputs
- `GET /api/download/<job_id>/<path:filename>` -> file download endpoint with safety checks

## 7.2 Data ingestion + normalization
For each uploaded subject file:

- reads `.csv` with `pd.read_csv`, others via `pd.read_excel`
- normalizes column names (`normalize_column`)
- accepts column aliases (`student_id`, `name`, `classscore`, etc.)
- validates required fields and records warnings for incomplete files/rows

## 7.3 Score and ranking calculations
- weighted final:
  - `final = (class_score * class_weight + exam_score * exam_weight) / 100`
- per-subject position:
  - competition ranking style (ties share same rank)
- overall:
  - total and average across available subjects
  - overall competition ranking

## 7.4 PDF generation pipeline
- per student:
  - subject rows built with `build_subject_rows`
  - template render function chosen by `template_id`:
    - `render_classic_template`
    - `render_modern_template`
    - `render_minimal_template`
- each PDF includes:
  - student metadata
  - marks table
  - overall summary lines
  - footer
  - theme colors
  - optional logo placement style

## 7.5 Logo processing
`load_logo_assets()`:
- validates image
- converts to RGBA
- creates normal and watermark variants
- watermark alpha is scaled by chosen opacity

`draw_logo()` places the logo based on style:
- `header_badge`
- `watermark`
- `corner_stamp`
- `side_mark`

## 7.6 Output packaging and cleanup
- individual student PDFs -> `generated/<job_id>/students/...`
- combined PDF -> `compiled_report_cards.pdf`
- ZIP -> `all_report_cards.zip`
- stale job folders are cleaned with `cleanup_generated_jobs()`
- download endpoint includes path traversal protection and optional delete-after-download behavior

---

## 8. Shared Style System Across Both Pages

Both pages use the same:

- typography stack:
  - `"Sora"` for UI and headings
  - `"Space Mono"` for technical/meta labels
- card language:
  - `.hero` for primary emphasis
  - `.panel` for structured sections
- animation:
  - `.reveal` + `@keyframes rise`
- button system:
  - `.btn`, `.btn-primary`, `.btn-accent`, `.btn-ghost`

This shared foundation is what makes `/` and `/about` feel consistent.

---

## 9. Responsive Behavior

Media queries at `980px` and `800px` adjust layout:

- multi-column grids collapse to single column
- cards/padding become tighter
- student result list items stack vertically on smaller screens

Result: the UI keeps readability on both desktop and mobile.

---

## 10. How It Was Made (Practical Build Story)

The implementation follows a clean progression:

1. Build a single-page workflow in `index.html` with step-by-step form sections.
2. Create a shared visual system in `styles.css` (tokens, panels, buttons, gradients, glow layers).
3. Add client-side behavior in `app.js` for validation, previews, dynamic controls, and result rendering.
4. Implement Flask API endpoints in `app.py`.
5. Add robust parsing/normalization for varied spreadsheet formats.
6. Implement ranking logic and score aggregation.
7. Build reusable PDF drawing helpers, then three template renderers.
8. Add logo branding modes, color theming, archive packaging, and secure download handling.
9. Add `/about` as a second page while reusing the same visual language for consistency.

This is why the project feels both practical (backend automation) and polished (frontend experience).

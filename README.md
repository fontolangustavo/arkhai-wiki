# Arkhai Wiki

Repository for the Arkhai game wiki, item database, upgrade simulation, ascension rules, and progression documentation.

## Purpose

This repository separates game documentation and balancing data from the Unity client and future backend services.

The goal is to keep a clean source for:

- item pages
- item progression
- upgrade rules
- ascension rules
- rarity definitions
- lore references
- future calculators and simulators

## Initial Structure

```txt
docs/
  index.md
  items/
  systems/

data/
  items.json
  upgrade-scaling.json
  ascension-rules.json
```

## Recommended Evolution

Phase 1: Markdown wiki with JSON data.

Phase 2: GitHub Pages documentation site.

Phase 3: Nextra/MDX interactive wiki with item simulators.

Phase 4: Shared definitions exported from the game backend.

## Running Locally

This wiki needs to be served over HTTP because the pages load JSON data with `fetch`.

### Windows PowerShell

```powershell
.\scripts\serve.ps1
```

If you prefer, you can also run the Node server directly:

```powershell
node .\scripts\serve.mjs
```

Then open `http://localhost:8000/`.

### Why not open the HTML file directly?

Browsers usually block `fetch()` from `file://` pages. Serving the site locally avoids that problem and matches the GitHub Pages deployment model.

## GitHub Pages

The site is built as a static wiki and can be published directly from the repository root.

- Keep page and asset links relative, which this repo already does.
- Keep `.nojekyll` in place so Pages serves files as-is.
- If you add new data files, load them through the shared JSON helpers in `assets/layout.js`.

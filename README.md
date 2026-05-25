# Arkhai Wiki

Repository for the Arkhai game wiki, item database, upgrade simulation, ascension rules, and progression documentation.

## Purpose

This repository separates game documentation and balancing data from the Unity client and future backend services.

The goal is to keep a clean source for:

- category pages
- weapon type indices
- item progression
- upgrade rules
- ascension rules
- rarity definitions
- lore references
- future calculators and simulators

## Current Structure

```txt
index.html
items.html
weapons.html
weapon-type.html
weapon.html
armors.html
accessories.html
materials.html
consumables.html
item.html
daggers.html
swords.html

assets/
  layout.js
  wiki.css
  items-data.js
  weapons-data.js
  equipment-catalog-page.js
  hub-page.js
  item-page.js
  weapon-page.js
  weapon-type-page.js
  weapons-page.js
  images/
data/
  items.json
  equipment-catalog.json
  daggers.json
docs/
  index.md
  items/
  systems/
```

## Navigation Model

- `items.html` is the public hub for categories.
- `weapons.html` lists weapon types.
- `weapon-type.html` lists families for the selected type.
- `weapon.html` shows the family, selected variant, and comparison data.
- `item.html`, `daggers.html`, and `swords.html` are legacy-compatible entry points that keep older links working.
- `armors.html`, `accessories.html`, and `materials.html` are public catalog pages driven by the family docs.

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

If you are using Git Bash or another POSIX-style shell on Windows, use forward slashes:

```bash
node ./scripts/serve.mjs
```

### Why not open the HTML file directly?

Browsers usually block `fetch()` from `file://` pages. Serving the site locally avoids that problem and matches the GitHub Pages deployment model.

## GitHub Pages

The site is built as a static wiki and can be published directly from the repository root.

- Keep page and asset links relative, which this repo already does.
- Keep `.nojekyll` in place so Pages serves files as-is.
- If you add new data files, load them through the shared JSON helpers in `assets/layout.js`.
- Prefer one source of truth in `arkhai/` and sync only curated public data here.

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

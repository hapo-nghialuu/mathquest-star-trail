# MathQuest: Star Trail Source of Truth Package

This package is the source-of-truth bundle for the MathQuest: Star Trail first
vertical MVP slice. It now uses the polished ChatGPT-generated image set placed
in the workspace on 2026-06-15, renamed and organized into the expected package
folders.

## Package Map

```text
mathquest_source_of_truth_package/
├── README.md
├── MathQuest_Star_Trail_Source_of_Truth.md
├── skills-lock.json
├── archive/
│   ├── README.md
│   ├── asset_intake_notes.md
│   └── vertical_mvp_prompt_reference.md
├── assets/
│   ├── references/
│   ├── screen_crops/
│   └── screens/
└── json/
    ├── mathquest_ai_agent_art_guideline.json
    ├── mathquest_asset_manifest.json
    └── mathquest_mvp_implementation_config.json
```

## Asset Folders

- `assets/screens/` contains the full-screen and concept-sheet images.
- `assets/references/` contains art direction sheets for palette, mascot, UI,
  and the map/world design.
- `assets/screen_crops/` contains reusable UI/visual modules cropped from the
  new polished assets.
- `json/` contains design guidance, the asset manifest, and the first MVP
  implementation config.

## MVP Scope

The first vertical slice is:

1. Adventure map with nodes 21-27.
2. Place Value lesson question.
3. Reward/completion screen for repairing the bridge.

The implementation should stay aligned with the polished image set and the JSON
guidance in this package.

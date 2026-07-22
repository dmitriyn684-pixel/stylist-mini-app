# DimkoFF brandbook delivery

This directory contains the versioned source material and verified visual evidence used by the DimkoFF portfolio MVP.

## Outputs

- Final PDF: `output/pdf/dimkoff-brandbook-2026.pdf`
- Published copy: `public/portfolio/dimkoff-brandbook-2026.pdf`
- Portfolio MVP: `public/portfolio/`
- Source documents: `brandbook/source/`
- Case visuals: `brandbook/assets/cases/`

## Evidence rules

- CaloriePT AI and Stylist AI remain the two main case studies.
- PsyMind AI, BusinessMentorAI_bot and Pulse AI Coach form the separate DimkoFF AI Bot Portfolio.
- Public Telegram cards confirm that the links and displayed names exist. They do not confirm unreviewed features or metrics.
- `BusinessMentorAI_bot` is the confirmed public display name. `Businessmen AI` remains a working case label until the owner approves a single name.
- No user counts, conversion, revenue, retention or AI accuracy are claimed without a source.

## Rebuild and QA

```text
npm run brandbook:capture
npm run brandbook:pdf
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
npm run brandbook:smoke
```

The PDF generator uses ReportLab and Windows Arial/Georgia fonts. PDF QA is performed by rendering all 25 pages to PNG with Poppler and visually inspecting the result.

## Assets still required for the final production edition

- Confirmed personal Telegram and email contacts.
- Confirmed Stylist AI production URL.
- Two to three internal, anonymized screens for each Telegram bot.
- 30-45 second flows for CaloriePT AI and Stylist AI.
- 20-30 second flows for PsyMind AI, BusinessMentorAI_bot and Pulse AI Coach.
- Owner-confirmed role, scope and measurable evidence for each case.

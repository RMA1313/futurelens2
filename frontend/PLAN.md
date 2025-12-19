# FutureLenz Frontend Plan (UI in Persian, RTL) — Flagship “Futures Situation Room”

All UI content will be in Persian with full RTL layout and zero English in the UI. This document is in English for alignment only. The experience is a narrative-driven, high-trust analytical instrument, not a generic SaaS dashboard.

## 1. Frontend Stack & Architecture
- Framework: Next.js (App Router, TypeScript). SSR for shell, client components for interactive panels and polling.
- State management: React state + lightweight Context for job/session, health, and theme accents; module-level state isolated to avoid global noise.
- API strategy: Typed REST client with Zod validation for `/api/health`, `/api/analyze`, `/api/jobs/:id`, `/api/jobs/:id/report`, `/api/jobs/:id/clarifications`. All text from API shown in Persian as-is; demo mode banner if provider not configured.
- Job polling: Client-side polling with progressive backoff (2–5s). Manual refresh button. Last-updated timestamp displayed. When status transitions to succeeded/failed, panels animate-in with semantic reveal (see motion section).
- Error/loading: Skeletons for cards, inline Persian error banners per panel, retry controls, health indicator in header. Loading states aligned with narrative (input → triage → evidence → synthesis).

## 2. Information Architecture (IA)
Primary screens/flows:
- Input & Upload: Paste text/upload file (PDF/DOCX/TXT placeholder). Health/dataset limits visible. Submission immediately creates job and moves to Status.
- Analysis Progress / Job Status: JobId, status badge, percent progress, module checklist, “what’s next” narrative. Clarification questions appear early if modules partial/inactive; direct link to answer.
- Results Dashboard: Situation-room canvas with anchored panels: document profile, coverage map, clarifications, trends, weak signals, critical uncertainties, scenarios, evidence explorer, exports.
- Evidence Explorer: Modal/drawer for chunk-level traceability; chips for chunk_id, snippets; cross-highlighting from claims.
- Clarification & Re-run: Inline Q&A in Persian; after submission, rerun pipeline and refresh dashboard with diff highlights.

Text flow diagram (RTL narrative):
ورودی → ایجاد شغل (jobId) → وضعیت و پیشرفت → (در صورت نیاز) سوالات روشن‌سازی → اجرای مجدد → داشبورد نتایج → اکسپلور شواهد/گزارش/صادرات.

## 3. Core UI Concepts
### a) Document Profile Card
- Purpose: Sets analytical frame (نوع سند، حوزه، افق، سطح تحلیل، برچسب دمو/واقعی). Anchors trust by stating scope and limits upfront.
- Effect on trust: Prominent placement, calm typography, concise chips; clarifies what the analysis covers and what it does not.
### b) Coverage Map
- Active/Partial/Inactive modules displayed as RTL grid with strong semantic color/status badges; tooltips list missing_information explicitly.
- Interaction: Clicking a module scrolls/highlights its panel; partial/inactive modules prompt clarifications.
### c) Analytical Panels
- Separate, collapsible cards for روندها (مگا/روند/میکرو), نشانه‌های ضعیف, عدم قطعیت‌های بحرانی, سناریوها.
- Interactions: Expand/compare mode, filters by برچسب fact/inference/assumption and confidence threshold, evidence chips that open explorer, side-by-side compare for scenario/uncertainty pairs.

## 4. Evidence & Trust UX
- Traceability: Every claim shows chunk_id chips; click opens snippet + full chunk in explorer. Evidence list is navigable and filterable.
- Confidence: Numeric + bar indicator (RTL) labeled in Persian (e.g., «اطمینان: 0.62»).
- Fact vs Inference vs Assumption: Pill colors/icons with legend; consistent across panels; default sort by confidence.

## 5. Persian & RTL Design System
- Typography: Persian-first font (e.g., Vazirmatn class), distinct scales for headings/body/labels; Persian numerals where meaningful.
- Spacing: Logical properties (margin-inline-start/end) with 8px rhythm; RTL-aware grids and chevrons.
- Numbers/dates: Prefer جلالی; otherwise Persian-formatted Gregorian with RTL digits.
- Icons: Mirrored direction for RTL; progress flows right-to-left where appropriate.

## 6. Visual Language
- Aesthetic: Futures Situation Room—premium, deliberate, analytical. Light or near-neutral base with controlled accent colors for status; subtle gradients for depth, thin borders plus low-elevation shadows.
- Cards/grids: Modular cards with hierarchy by spacing and typographic weight; grids adapt per breakpoint.
- Motion: Subtle, purposeful (see Motion Design System); no decorative loops.

## 7. Responsiveness & Accessibility
- Desktop-first for analysts; responsive stacking on tablet/mobile. Evidence explorer becomes full-screen drawer on small screens.
- Accessibility: High contrast, clear focus states, keyboard navigation for expand/filter/open evidence; aria labels in Persian.
- Readability: Comfortable line lengths; avoid dense walls of text by using bullets and spacing.

## 8. Error, Empty & Edge States
- Missing data/partial: Panel header shows وضعیت جزئی/ناکامل with Persian guidance; link to clarifications.
- Demo mode: Banner explaining نتایج دمو و محدودیت استنادی.
- Backend unavailable: Full-page Persian error, retry CTA, health check surface.
- Upload/validation: Inline Persian guidance for size/type limits; calm tone.

## 9. Narrative UX Flow (new)
- Cognitive journey: From orientation → triage → evidence → synthesis → action. Users see system confidence and gaps before interpretations.
- Reveal order: 1) سلامت و دمو/واقعی، 2) پروفایل سند (چارچوب)، 3) پوشش ماژول و کمبود داده (شفافیت زودهنگام)، 4) سوالات روشن‌سازی (در صورت نیاز)، 5) شواهد خام با ارجاع، 6) تحلیل‌های مشتق (روند/نشانه/عدم قطعیت)، 7) سناریوها، 8) گزارش/صادرات.
- Emotional arc: Calm authority → transparency about gaps → sense of control via clarifications and filters → confidence via evidence-linked insights.

## 10. Motion Design System (new)
- Principles: Semantic, restrained, duration 150–250ms; easing for confidence (ease-out), for warnings (ease-in-out with slight shake/offset).
- Reveal: Panels fade/slide-in from right (RTL) in narrative order; evidence chips highlight briefly when their claim card mounts.
- Emphasis: On hover/focus, scale +2% and elevate shadow minimally; for confidence warnings (low confidence or partial), pulse border once.
- Warning/incomplete: Partial/inactive modules use a brief color flash on badge then settle to steady state; clarifications prompt a gentle nudge animation.
- Confidence: Higher confidence items load with smoother fade; low confidence shows delayed reveal plus a subtle caution icon animation.

## 11. Exploratory & Control Mechanics (new)
- Comparison modes: Side-by-side panes for scenarios or uncertainties; toggle to “compare” locks scroll and highlights shared evidence.
- Focus/isolate: “تمرکز” mode dims all but selected panel or evidence chain; evidence explorer supports step-through of claims referencing same chunk.
- Progressive disclosure: Default collapsed detail; expand for rationale/evolution/indicators; advanced filters behind a “جزئیات بیشتر” control to reduce overload.
- Filtering: Global filters for confidence threshold and label type; per-panel chips to isolate categories (مگا/روند/میکرو).

## 12. Situation-Room Mental Model (new)
- Layout logic: Command bar (health, job, demo badge) at top; left-anchored (RTL) profile and coverage for orientation; central analytical panels; right rail (RTL end) for clarifications and actions.
- Attention control: Primary signals (coverage and alerts) near top; evidence explorer accessible from any panel; consistent badge language; minimal chrome.
- Mimic analysis room: Clear zones—“Context” (پروفایل/پوشش), “Evidence” (اکسپلورر/شواهد), “Synthesis” (روند/نشانه/عدم قطعیت/سناریو), “Action” (صادرات/گزارش/بازاجرای روشن‌سازی).

## 13. “Trust by Design” (new)
- Credibility cues: Clean grid, measured whitespace, consistent status colors, calm typography; all claims tethered to evidence chips.
- Surfacing limits: Partial/inactive called out with tooltips listing missing_information; confidence bars always visible; demo banner explicit.
- Motion/spacing: No jitter; steady placements; animations only to signal state changes; spacing that avoids clutter and respects cognitive load.

## 14. Deliverables Checklist (post-approval)
- Pages: ورودی/آپلود، وضعیت شغل، داشبورد نتایج، اکسپلورر شواهد (modal/drawer).
- Components: وضعیت سلامت/دمو، کارت پروفایل سند، نقشه پوشش، پنل روندها، پنل نشانه‌های ضعیف، پنل عدم قطعیت، پنل سناریو، پنل سوالات روشن‌سازی و فرم پاسخ، نوار پیشرفت شغل، کارت شواهد/اسنیپت، بنر خطا/دمو، فیلترها و برچسب‌ها (fact/inference/assumption), کنترل‌های confidence، مقایسه سناریو/عدم قطعیت، نوار فرمان بالا.
- Utilities: API client با Zod validation، polling hook با backoff، formatters (اعداد/تاریخ/confidence فارسی)، RTL helpers.
- Styles: RTL base (direction, spacing), status/label color system, motion tokens (durations/easing), layout grid.
- Mock data: Minimal Persian fixtures for layout/dev without backend.

## Why this design feels fundamentally different from typical dashboards
- Narrative-first: Insights unfold in a deliberate sequence, mirroring analyst reasoning, not a flat widget grid.
- Situation-room model: Clear zones for context, evidence, synthesis, and action—designed for high-stakes decisions.
- Trust-centric: Every claim is anchored to evidence chips, confidence, and label semantics; limits and demo status are explicit.
- Semantic motion: Animations communicate state, completeness, and urgency rather than decoration.
- Control for experts: Comparison, focus, and progressive disclosure reduce overload while enabling deep exploration in Persian, RTL.***

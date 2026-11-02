# PINTUKU Internationalization & UI Language Standard

## Purpose
Separate interface language from visual presentation and business data. The current pilot supports Indonesian (id) and English (en) on HUMAS pages.

## Locale contract
- Indonesian (id) is the default and fallback locale.
- English (en) is an additional interface locale.
- Persist preference under localStorage key pintuku-language.
- Set the html lang attribute to the active locale.
- Dispatch pintuku:languagechange with detail.language after a locale change.
- Language selection must not alter routes, permissions, records, workflow states, or audit history.

## Translation architecture
- Translation keys and locale dictionaries belong to the presentation layer.
- New modules should use stable semantic keys such as humas.partnership.title, not incidental full-sentence DOM text.
- Prefer data-i18n, data-i18n-placeholder, and data-i18n-aria-label attributes for new UI components.
- The existing HUMAS exact-text dictionary and MutationObserver are a transitional compatibility layer, not the long-term pattern.
- Keep translated strings out of CSS selectors, class names, route paths, database enum values, and API contracts.
- Do not automatically translate user-generated content. Store explicit language variants when partner content is multilingual and retain the source language.

## Visual system contract
- Shared visual tokens live in pintuku-glass.css; module styles consume shared tokens and component classes.
- Glass styling is independent of locale. Text wrapping must remain fluid for longer translations.
- Every module must support data-theme dark and light.
- Use semantic HTML, visible keyboard focus, sufficient contrast, and reduced-motion support.
- Blur is decorative enhancement. Components must remain readable when backdrop-filter is unavailable.

## Existing background preservation
- Existing page backgrounds, photographs, gradients, overlays, and module-specific background layers are owned by each module and must be preserved by default.
- The shared glass stylesheet must not set a global body background or replace a page's background image.
- Shared styling should refine component-level surfaces: border, radius, elevation, blur, focus state, and spacing.
- If a component already has a designed background, keep its background declaration and apply only compatible refinements unless a redesign is explicitly approved.
- Akademik's existing background and liquid-glass assets remain authoritative. Kesiswaan already has its own deep-glass system and background layer; do not overwrite either with PINTUKU defaults.
- Verify each module at desktop and mobile widths after adding the shared stylesheet. Watch CSS cascade order and avoid broad selectors that change legacy layouts.

## Date, number, and currency formatting
Use browser Intl APIs with an explicit locale: Intl.DateTimeFormat, Intl.NumberFormat, and Intl.Collator.
Store dates in ISO format and numeric values as numbers; format only at the presentation boundary. Currency must specify an ISO 4217 currency code.

## Official and legal documents
- UI locale does not determine the language of MoU/PKS or other official documents.
- Keep the signed source document immutable.
- A translated copy must be identified as a translation and reviewed by an authorized human before external or legal use.
- Never treat machine translation as the authoritative legal version without approval.

## Quality gates before wider rollout
For every module, verify ID and EN coverage for headings, navigation, buttons, forms, validation, empty states, dialogs, status labels, and accessibility labels; test layout at 320px, 768px, and desktop; verify theme and locale persistence; test keyboard focus and reduced motion; ensure user-generated and legal content is not silently rewritten; and confirm the build output contains shared styles and locale resources.

## Current implementation status
- HUMAS catalogue and Kemitraan & MoU: existing ID/EN dictionary pilot.
- Shared settings panel: theme and locale controls.
- Shared Glass stylesheet: introduced as first reusable token layer.
- Other PINTUKU modules: not yet certified for English coverage.
- Supabase data, Auth, and workflow integration: independent of this UI standard and not implied by language support.

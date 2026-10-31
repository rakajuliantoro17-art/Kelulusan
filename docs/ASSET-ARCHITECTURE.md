# Asset Architecture

All shared static media for PINTUKU and its modules live in the repository-root `public/assets/`. Application source remains under `src/`.

```text
public/assets/
├── shared/
│   ├── icons/
│   ├── logos/
│   ├── images/
│   └── fonts/
├── pintuku/
├── sarpras/
├── akademik/
│   ├── images/
│   └── audio/
└── kesiswaan/
    ├── logos/
    └── signatures/
```

## Rules
- Use `/assets/shared/...` for media shared by multiple modules.
- Use `/assets/<module>/...` for module-specific media.
- Keep HTML, CSS, JavaScript, JSON application data, and module logic under `src/`; they are source, not shared static media.
- Avoid duplicate copies of identical images, logos, icons, fonts, and audio.
- Use absolute root-relative paths beginning with `/assets/` in HTML, CSS, JavaScript, and manifests.
- Anything in `public/` is publicly retrievable. Do not put credentials, student records, private documents, or sensitive signatures here. The existing headmaster-signature image remains in the public asset tree for compatibility; move it to authenticated storage if it is not intended for public access.
- The existing Sarpras font files are 1-byte placeholders, not usable font binaries. Replace them with valid licensed font files before relying on them in production.

## Migration status
Module image, logo, icon, audio, and font files have been centralized. Primary module entrypoints, manifests, and known CSS/JS asset references have been updated. Continue checking older/legacy pages and generated build output during the deployment/build phase.

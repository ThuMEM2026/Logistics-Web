# TTS 教学声音试听

Audience: teachers comparing cloned classroom narration, on desktop and phones.
Task: choose a teacher, hear the same script, compare cost and practical limits.

Existing visual language retained: Garden, warm paper, forest ink, quiet rules.
Display type: Songti; body: system Chinese sans. No remote fonts or decorative imagery.
Macrostructure: editorial listening workbench. One shared application across existing
entry points, then a stacked price directory and a local-only two-provider estimate.
All media and existing routes remain. Main entry defaults to Cai's 35-second-source
long test; Zhang's existing link defaults to Zhang's long test.

Prices: Beijing CNY, checked 2026-10-22. Ali character TTS lists both official billing
units and ×2 pure-Han conversion. Realtime is token-priced; observed equivalents
are labelled estimates. Youdao 50% and free cloning are a project quotation,
not a public price or verified settled bill. No synthesized-audio invoice claims.

Evidence: distinguish official limits, generated sample facts, user hearing feedback,
and pending human acceptance. Nine concatenated requests are never labelled a
continuous-generation test. ASR is not a guarantee of zero errors.

Accessibility: native audio, one playing at a time, explicit form labels, visible
keyboard focus, responsive rows, no horizontal root overflow, reduced-motion respect.
Feedback stays in localStorage and JSON export; existing short-sample keys retained.

Pre-emit self-check: P4 H4 E4 S4 R4 V4. Genre: education comparison tool.
Contrast: forest text on paper/surface; muted text minimum body size 14px.
Shared visual tokens live in tokens.css; all new CSS uses these tokens.
# Playback maintenance · 2026-10-28

Use MP3 derivatives for online listening and retain the original media and its
audit hash. The catalog's `file` remains the original; `playbackFile` selects a
smaller download. Prices, speaker source, synthesis text and test findings do
not change. All native players use `preload="none"`; a click starts the request.
The shared audio player provides an inline retry, including interrupted-play
position, and starts play during a user gesture before deferred seeking.
Only `/tts` on the apex host redirects to the working www host. Other project
routes and subdomains retain their configuration. This reduces avoidable
transfer and recovers transient failures; it does not guarantee mainland routes
to the overseas hosting platform.

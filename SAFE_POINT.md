# SIGAPP Safe Points

## SAFE POINT 6 — NTT Migration Complete
**Commit:** d3dff59e178122a823872f01650bdfb36abbf915  
**Date:** 2026-05-05  
**Status:** ✅ Build passing, NTT data active

### Changes in this safe point
- `src/lib/types.ts` — Added `SekolahNTT`, `SekolahNTTIndex`, `SekolahNTTFull` types
- `src/hooks/useSekolahNTT.ts` — New hook querying `sekolah_ntt_full` with `adaptSekolahNTT()` adapter
- `src/app/(fullscreen)/page.tsx` — Switched to `useSekolahNTT`, label updated to "NTT Dashboard"
- `src/components/map/SchoolMap.tsx` — Map centered to NTT `[-8.6573, 121.0794]`, zoom 8, NTT kabupaten labels

### Notes
- All existing Jakarta types preserved in `types.ts`
- All UI components (Sidebar, FilterBar, RankedTab, StatsTab, ChatWidget) untouched
- Supabase table: `sekolah_ntt_full` (index data embedded, no join needed)

---

## SAFE POINT 5 — Jakarta Baseline (Pre-NTT)
**Commit:** 9e94dd305ba95c4c9b71b77f0cb536238436bcbd  
**Status:** ✅ Build passing, Jakarta data

-- ============================================================
-- SIGAPP Macro Insight Schema
-- Migration: 20260525_macro_insight_schema
-- ============================================================

-- 1. macro_insight_reports (report metadata)
CREATE TABLE IF NOT EXISTS macro_insight_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_label text NOT NULL,
  semester_date  timestamptz NOT NULL,
  generated_at   timestamptz NOT NULL DEFAULT now(),
  trigger_type   text NOT NULL CHECK (trigger_type IN ('auto', 'manual')),
  generated_by   text,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'sent'))
);

CREATE INDEX IF NOT EXISTS idx_mir_semester_date ON macro_insight_reports (semester_date DESC);

-- 2. macro_insight_kecamatan (per-kecamatan per-report)
CREATE TABLE IF NOT EXISTS macro_insight_kecamatan (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id             uuid NOT NULL REFERENCES macro_insight_reports(id) ON DELETE CASCADE,
  kecamatan_name        text NOT NULL,
  kabupaten_name        text NOT NULL,
  sigapp_index          numeric NOT NULL,
  total_schools         integer NOT NULL DEFAULT 0,
  critical_schools      integer NOT NULL DEFAULT 0,
  stable_schools        integer NOT NULL DEFAULT 0,
  dominant_dimension    text NOT NULL,
  spatial_pattern       text NOT NULL,
  trend_type            text NOT NULL,
  delta_from_prev       numeric,
  agent_summary         text,
  agent_recommendation  text
);

CREATE INDEX IF NOT EXISTS idx_mik_report ON macro_insight_kecamatan (report_id);

-- 3. macro_insight_kabupaten (per-kabupaten per-report)
CREATE TABLE IF NOT EXISTS macro_insight_kabupaten (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id               uuid NOT NULL REFERENCES macro_insight_reports(id) ON DELETE CASCADE,
  kabupaten_name          text NOT NULL,
  sigapp_index_avg        numeric NOT NULL,
  total_kecamatan         integer NOT NULL DEFAULT 0,
  critical_kecamatan      integer NOT NULL DEFAULT 0,
  best_kecamatan          text,
  worst_kecamatan         text,
  dominant_dimension      text NOT NULL,
  trend_type              text NOT NULL,
  delta_from_prev         numeric,
  agent_executive_summary text,
  agent_recommendation    text
);

CREATE INDEX IF NOT EXISTS idx_mikab_report ON macro_insight_kabupaten (report_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE macro_insight_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_insight_kecamatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_insight_kabupaten ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key)
CREATE POLICY "Allow public read on macro_insight_reports"
  ON macro_insight_reports FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on macro_insight_kecamatan"
  ON macro_insight_kecamatan FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on macro_insight_kabupaten"
  ON macro_insight_kabupaten FOR SELECT
  USING (true);

-- Allow service-role insert/update (for agent and cron)
CREATE POLICY "Allow service insert on macro_insight_reports"
  ON macro_insight_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service update on macro_insight_reports"
  ON macro_insight_reports FOR UPDATE
  USING (true);

CREATE POLICY "Allow service insert on macro_insight_kecamatan"
  ON macro_insight_kecamatan FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service insert on macro_insight_kabupaten"
  ON macro_insight_kabupaten FOR INSERT
  WITH CHECK (true);

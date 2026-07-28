import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID sekolah tidak valid" }, { status: 400 });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      WITH ranked AS (
        SELECT
          s.*,
          i.sigapp_index,
          i.p1_quality_gap,
          i.p2_spatial_inequity,
          i.p3_structural_risk,
          i.p4_public_signal,
          i.notes AS index_notes,
          i.computed_at,
          p.teacher_ratio,
          p.facility_score,
          p.nearest_school_km,
          p.disaster_risk_score,
          p.internet_access,
          p.remote_status,
          ROW_NUMBER() OVER (ORDER BY i.sigapp_index DESC NULLS LAST) AS rank
        FROM public.sekolah_ntt AS s
        LEFT JOIN public.sekolah_ntt_index AS i ON i.school_id = s.id
        LEFT JOIN public.sekolah_ntt_pillar AS p ON p.school_id = s.id
      )
      SELECT * FROM ranked WHERE id = ${id} LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch sekolah detail:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail sekolah" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        s.*,
        to_jsonb(si) AS school_index
      FROM public.schools AS s
      LEFT JOIN LATERAL (
        SELECT *
        FROM public.school_index AS si
        WHERE si.school_id = s.id
        ORDER BY si.is_latest DESC NULLS LAST, si.computed_at DESC NULLS LAST
        LIMIT 1
      ) AS si ON true
      ORDER BY s.school_name;
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch schools:", error);
    return NextResponse.json(
      { error: "Gagal memuat data sekolah" },
      { status: 500 },
    );
  }
}

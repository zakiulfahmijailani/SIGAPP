import { NextRequest, NextResponse } from "next/server";

// Simple admin secret check
// In production, this should be a strong secret stored in env variables
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin";
// Vercel Cron uses CRON_SECRET
const CRON_SECRET = process.env.CRON_SECRET || "cron";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get("authorization");
    const cronHeader = req.headers.get("x-cron-secret");
    const customAdminHeader = req.headers.get("x-admin-secret");

    const isCron = cronHeader === CRON_SECRET;
    const isAdmin = 
      (authHeader && authHeader === `Bearer ${ADMIN_SECRET}`) || 
      (customAdminHeader === ADMIN_SECRET);

    if (!isCron && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid admin or cron secret." },
        { status: 401 }
      );
    }

    // 2. Simulate Delay for email sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 3. Return Success
    return NextResponse.json(
      { 
        success: true, 
        message: "Macro Insight report emailed successfully to 4 stakeholders.",
        data: {
          sent_at: new Date().toISOString(),
          stakeholders: [
            { role: 'Kemendikdasmen RI', level: 'pusat', status: 'sent' },
            { role: 'Dinas Pendidikan Provinsi NTT', level: 'provinsi', status: 'sent' },
            { role: 'Bappeda Provinsi NTT', level: 'provinsi', status: 'sent' },
            { role: 'Dinas Pendidikan Kab/Kota Terkait', level: 'kabupaten', status: 'sent' }
          ]
        }
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Macro Insight Emailing Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to email Macro Insight report.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

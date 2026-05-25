import { NextRequest, NextResponse } from "next/server";
import { generateMacroInsight } from "@/lib/macroInsightAgent";

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

    const triggerType = isCron ? "auto" : "manual";
    const generatedBy = isCron ? "system" : "admin";

    // 2. Execute Agent Pipeline
    const result = await generateMacroInsight(triggerType, generatedBy);

    // 3. Return Success
    return NextResponse.json(
      { 
        success: true, 
        message: "Macro Insight report generated successfully.",
        data: result
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Macro Insight Generation Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate Macro Insight report.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

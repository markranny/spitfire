import { db } from "@/db/drizzle/db";
import { submissions } from "@/db/drizzle/schema/submission";
import { resumes } from "@/db/drizzle/schema/resume";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { dataMapper } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const allSubmissions = await db.select().from(submissions).leftJoin(resumes, eq(submissions.resumeId, resumes.id));
    return Response.json({
      success: true,
      submissions: allSubmissions.map(submission => ({
        submission: submission?.submissions ?? null,
        resume: submission?.resumes?.resumeData ? dataMapper(submission.resumes.resumeData) : null,
      })),
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

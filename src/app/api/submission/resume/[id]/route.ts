import { db } from "@/db/drizzle/db";
import { resumes } from "@/db/drizzle/schema/resume";
import { submissions } from "@/db/drizzle/schema/submission";
import { getUser } from "@/lib/getUser";
import { dataMapper } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }
    const submission = await db.select().from(submissions).where(eq(submissions.resumeId, id));
    const submissionData = submission[0];
    if (!submissionData) {
      return Response.json({ success: false, error: "Submission not found" }, { status: 404 });
    }
    const resumeData = await db.select().from(resumes).where(eq(resumes.id, submissionData.resumeId));
    if (!resumeData[0]) {
      return Response.json({ success: false, error: "Resume not found" }, { status: 404 });
    }
    return Response.json({
      success: true,
      submission: submissionData,
      resume: resumeData[0]?.resumeData ? dataMapper(resumeData[0].resumeData) : null,
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

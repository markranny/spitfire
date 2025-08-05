import { db } from "@/db/drizzle/db";
import { submissions } from "@/db/drizzle/schema/submission";
import { resumes } from "@/db/drizzle/schema/resume";
import { getUser } from "@/lib/getUser";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import SubmissionState from "@/lib/interfaces/submissionState";
import { dataMapper } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }
    const userSubmissions = await db.select().from(submissions).leftJoin(resumes, eq(submissions.resumeId, resumes.id)).where(eq(submissions.userId, user.id));
    return Response.json({
      success: true,
      submissions: userSubmissions.map(submission => ({
        submission: submission?.submissions ?? null,
        resume: submission?.resumes?.resumeData ? dataMapper(submission.resumes.resumeData) : null,
      })),
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Create a new submission
export async function POST(request: NextRequest, ) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { submission } = body;

    if (!submission) {
      return Response.json({ success: false, error: "Missing submission data" }, { status: 400 });
    }

    const newSubmissionData = {
      ...submission,
      userId: user.id,
      state: SubmissionState.NEEDS_REVIEW, // Default state for new submissions
    };

    const newSubmission = await db.insert(submissions).values(newSubmissionData).returning();

    return Response.json({
      success: true,
      submission: newSubmission[0],
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { db } from "@/db/drizzle/db";
import { resumes } from "@/db/drizzle/schema/resume";
import { submissions } from "@/db/drizzle/schema/submission";
import { getUser, MembershipLevel } from "@/lib/getUser";
import { dataMapper } from "@/lib/utils";
import { UpdateSubmission } from "@/types/api/requests";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }
    const submission = await db.select().from(submissions).where(eq(submissions.id, id))
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    if (!id) {
      return Response.json({ success: false, error: "Invalid Submission ID" }, { status: 400 });
    }

    const body: UpdateSubmission = await request.json();
    const submissionData = body?.submission;
    if (!submissionData) {
      return Response.json({ success: false, error: "Missing submission data" }, { status: 400 });
    }

    let whereClause = user.level !== MembershipLevel.Admin
      ? and(eq(submissions.id, id), eq(submissions.userId, user.id))
      : eq(submissions.id, id);

    const updatedSubmission = await db.update(submissions).set({
      state: submissionData.state ?? undefined,
      name: submissionData.name ?? undefined,
      email: submissionData.email ?? undefined,
      airlinePreference: submissionData.airlinePreference ?? undefined,
      position: submissionData.position ?? undefined,
      selectedTemplates: submissionData.selectedTemplates ?? undefined,
    }).where(whereClause).returning();

    if (!updatedSubmission[0]) {
      return Response.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      submission: updatedSubmission[0],
    });
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    if (!id) {
      return Response.json({ success: false, error: "Invalid Submission ID" }, { status: 400 });
    }

    const deletedSubmission = await db.delete(submissions).where(and(eq(submissions.id, id), eq(submissions.userId, user.id))).returning();

    if (!deletedSubmission[0]) {
      return Response.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    // Delete the associated resume
    await db.delete(resumes).where(eq(resumes.id, deletedSubmission[0].resumeId)).returning();

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

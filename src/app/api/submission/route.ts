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
    
    try {
      const userSubmissions = await db.select().from(submissions).leftJoin(resumes, eq(submissions.resumeId, resumes.id)).where(eq(submissions.userId, user.id));
      
      return Response.json({
        success: true,
        submissions: userSubmissions.map(submission => ({
          submission: submission?.submissions ?? null,
          resume: submission?.resumes?.resumeData ? dataMapper(submission.resumes.resumeData) : null,
        })),
      });
    } catch (dbError: any) {
      console.error("Database error in GET /api/submission:", dbError);
      return Response.json({ 
        success: false, 
        error: "Database error: " + (dbError.message || "Unknown database error")
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in GET /api/submission:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received submission data:", body); 

    const submissionData = body.submission || body;
    
    const {
      resumeId,
      name,
      email,
      airlinePreference,
      position,
      selectedTemplates
    } = submissionData;

    console.log("Extracted submission data:", {
      resumeId,
      name,
      email,
      airlinePreference,
      position,
      selectedTemplates
    });

    if (!resumeId || resumeId.trim() === '') {
      return Response.json({ 
        success: false, 
        error: "resumeId is required and cannot be empty" 
      }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return Response.json({ 
        success: false, 
        error: "name is required and cannot be empty" 
      }, { status: 400 });
    }

    if (!email || email.trim() === '') {
      return Response.json({ 
        success: false, 
        error: "email is required and cannot be empty" 
      }, { status: 400 });
    }

    if (!airlinePreference || airlinePreference.trim() === '') {
      return Response.json({ 
        success: false, 
        error: "airlinePreference is required and cannot be empty" 
      }, { status: 400 });
    }

    try {
      const existingResume = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
      if (!existingResume.length) {
        return Response.json({ 
          success: false, 
          error: `Resume not found with ID: ${resumeId}` 
        }, { status: 400 });
      }

      if (existingResume[0].userId !== user.id) {
        return Response.json({ 
          success: false, 
          error: "You don't have permission to submit this resume" 
        }, { status: 403 });
      }

      const existingSubmission = await db.select().from(submissions).where(eq(submissions.resumeId, resumeId)).limit(1);
      if (existingSubmission.length > 0) {
        return Response.json({ 
          success: false, 
          error: "Submission already exists for this resume" 
        }, { status: 400 });
      }

      const newSubmissionData = {
        userId: user.id,
        resumeId: resumeId.trim(),
        state: SubmissionState.NEEDS_REVIEW, 
        name: name.trim(),
        email: email.trim(),
        airlinePreference: airlinePreference.trim(),
        position: position?.trim() || null,
        selectedTemplates: selectedTemplates || [],
      };

      console.log("Creating submission with data:", newSubmissionData); 

      const newSubmission = await db.insert(submissions).values(newSubmissionData).returning();

      return Response.json({
        success: true,
        submission: newSubmission[0],
      });

    } catch (dbError: any) {
      console.error("Database error in POST /api/submission:", dbError);
      return Response.json({ 
        success: false, 
        error: "Database error: " + (dbError.message || "Failed to create submission")
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating submission:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
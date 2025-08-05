import { db } from "@/db/drizzle/db";
import { resumes } from "@/db/drizzle/schema/resume";
import { getUser } from "@/lib/getUser";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }
    const resume = await db.select().from(resumes).where(eq(resumes.id, id));
    const resumeData = resume[0]?.resumeData;
    if (!resumeData) {
      return Response.json({ success: false, error: "Resume not found" }, { status: 404 });
    }
    return Response.json({
      success: true,
      resumeData,
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
      return Response.json({ success: false, error: "Invalid resume ID" }, { status: 400 });
    }

    const { resumeData } = await request.json();
    if (!resumeData) {
      return Response.json({ success: false, error: "Missing resume data" }, { status: 400 });
    }

    const updatedResume = await db.update(resumes).set({ resumeData }).where(eq(resumes.id, id)).returning();

    if (!updatedResume[0]) {
      return Response.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      resumeData: updatedResume[0].resumeData,
    });
  } catch (error: any) {
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
      return Response.json({ success: false, error: "Invalid resume ID" }, { status: 400 });
    }

    const deletedResume = await db.delete(resumes).where(eq(resumes.id, id)).returning();

    if (!deletedResume[0]) {
      return Response.json({ success: false, error: "Resume not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

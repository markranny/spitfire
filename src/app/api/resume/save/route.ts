import { db } from "@/db/drizzle/db";
import { resumes } from "@/db/drizzle/schema/resume";
import { getUser } from "@/lib/getUser";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const { resumeData } = await request.json();
    if (!resumeData) {
      return Response.json({ success: false, error: "Missing resume data" }, { status: 400 });
    }

    const newResume = await db
      .insert(resumes)
      .values({
        userId: user.id,
        resumeData,
      })
      .returning();

    return Response.json({
      success: true,
      resume: {
        id: newResume[0].id,
        resumeData: newResume[0].resumeData,
      },
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

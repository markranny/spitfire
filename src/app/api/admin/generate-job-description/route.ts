import { getUser } from "@/lib/getUser";
import { getGenerateJobDescriptionPrompt } from "@/lib/prompts/getGenerateJobDescriptionPrompt";
import { NextRequest } from "next/server";
import { generateGeminiResponse } from "../../scorecard/upload/route";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const jobDescriptionData = await request.json();
    if (!jobDescriptionData || !jobDescriptionData.description) {
      return Response.json({ success: false, error: "Missing job description data" }, { status: 400 });
    }

    const description = jobDescriptionData.description;
    const company = jobDescriptionData?.company ?? null;
    const title = jobDescriptionData?.title ?? null;
    const aircraft = jobDescriptionData?.aircraft ?? null;

    const generateJobDescriptionPrompt = getGenerateJobDescriptionPrompt(description, company, title, aircraft);
    const response = await generateGeminiResponse([
      {
        text: generateJobDescriptionPrompt,
      },
      {
        functionResponse: {
          name: "response.json",
          response: {
            "type": "object",
            "properties": {
              "job_description": {
                "type": "array",
                "items": {
                  "type": "string",
                }
              }
            },
            "required": [
              "job_description"
            ]
          },
        },
      }
    ]);

    const { job_description } = JSON.parse(response);
    if (!job_description || !Array.isArray(job_description) || job_description.length < 3) {
      return Response.json({
        success: false,
      });
    }

    return Response.json({
      success: true,
      description: job_description.map((bullet: string) => bullet.trim().replaceAll("•", "")).join("\n"),
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

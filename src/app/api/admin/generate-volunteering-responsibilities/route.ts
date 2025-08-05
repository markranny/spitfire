import { getUser } from "@/lib/getUser";
import { getGenerateVolunteeringResponsibilitiesPrompt } from "@/lib/prompts/getGenerateVolunteeringResponsibilitiesPrompt";
import { NextRequest } from "next/server";
import { generateGeminiResponse } from "../../scorecard/upload/route";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const responsibilitiesData = await request.json();
    if (!responsibilitiesData || !responsibilitiesData.responsibilities) {
      return Response.json({ success: false, error: "Missing responsibilities data" }, { status: 400 });
    }

    const responsibilities = responsibilitiesData.responsibilities;
    const organization = responsibilitiesData?.organization ?? null;
    const volunteering_type = responsibilitiesData?.volunteering_type ?? null;

    const generateVolunteeringResponsibilitiesPrompt = getGenerateVolunteeringResponsibilitiesPrompt(responsibilities, organization, volunteering_type);
    const response = await generateGeminiResponse([
      {
        text: generateVolunteeringResponsibilitiesPrompt,
      },
      {
        functionResponse: {
          name: "response.json",
          response: {
            "type": "object",
            "properties": {
              "volunteering_description": {
                "type": "array",
                "items": {
                  "type": "string",
                }
              }
            },
            "required": [
              "volunteering_description"
            ]
          },
        },
      }
    ]);

    const { volunteering_description } = JSON.parse(response);
    if (!volunteering_description || !Array.isArray(volunteering_description) || volunteering_description.length < 3) {
      return Response.json({
        success: false,
      });
    }

    return Response.json({
      success: true,
      responsibilities: volunteering_description.map((bullet: string) => bullet.trim().replaceAll("•", "")).join("\n"),
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

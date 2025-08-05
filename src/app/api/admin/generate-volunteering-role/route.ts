import { getUser } from "@/lib/getUser";
import { getGenerateVolunteeringRolePrompt } from "@/lib/prompts/getGenerateVolunteeringRolePrompt";
import { NextRequest } from "next/server";
import { generateGeminiResponse } from "../../scorecard/upload/route";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }

    const roleData = await request.json();
    if (!roleData || !roleData.role) {
      return Response.json({ success: false, error: "Missing role data" }, { status: 400 });
    }

    const role = roleData.role;
    const organization = roleData?.organization ?? null;
    const volunteering_type = roleData?.volunteering_type ?? null;

    const generateVolunteeringRolePrompt = getGenerateVolunteeringRolePrompt(role, organization, volunteering_type);
    const response = await generateGeminiResponse([
      {
        text: generateVolunteeringRolePrompt,
      },
      {
        functionResponse: {
          name: "response.json",
          response: {
            "type": "object",
            "properties": {
              "role": {
                "type": "string",
              }
            },
            "required": [
              "role"
            ]
          },
        },
      }
    ]);

    const roleJsonData = JSON.parse(response);
    if (!roleJsonData || !roleJsonData.role || !roleJsonData.role.length) {
      return Response.json({
        success: false,
      });
    }

    return Response.json({
      success: true,
      role: roleJsonData.role,
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

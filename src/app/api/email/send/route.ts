import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/sendgrid";
import { getUser } from "@/lib/getUser";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, html, text } = await request.json();

    if (!to || !subject || !html) {
      return Response.json(
        { success: false, error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    const result = await sendEmail({ to, subject, html, text });

    if (result.success) {
      return Response.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
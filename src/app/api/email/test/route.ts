import { NextRequest } from "next/server";
import { getUser, MembershipLevel } from "@/lib/getUser";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    
    // Only allow admin users to send test emails
    if (!user || user.level !== MembershipLevel.Admin) {
      return Response.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 401 });
    }

    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return Response.json(
        { success: false, error: "Missing testEmail parameter" },
        { status: 400 }
      );
    }

    // Send test email
    const result = await sendEmail({
      to: testEmail,
      subject: "Test Email - Spitfire Elite Aviation System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ea580c;">🧪 Email System Test</h2>
          
          <p>This is a test email from the Spitfire Elite Aviation resume submission system.</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Test Details</h3>
            <ul>
              <li><strong>Sent at:</strong> ${new Date().toISOString()}</li>
              <li><strong>From:</strong> ${process.env.SENDGRID_FROM_EMAIL}</li>
              <li><strong>System:</strong> Resume Builder Email Notifications</li>
            </ul>
          </div>
          
          <p>If you received this email, your SendGrid configuration is working correctly! ✅</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is a test email from the admin panel.
          </p>
        </div>
      `,
      text: `This is a test email from the Spitfire Elite Aviation resume submission system. Sent at ${new Date().toISOString()}. If you received this email, your SendGrid configuration is working correctly!`
    });

    if (result.success) {
      return Response.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId
      });
    } else {
      return Response.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
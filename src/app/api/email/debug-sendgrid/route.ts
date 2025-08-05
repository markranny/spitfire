import { NextRequest } from "next/server";
import { getUser, MembershipLevel } from "@/lib/getUser";
import sgMail from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    
    // Only allow admin users to debug
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

    // Check environment variables
    const envCheck = {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'Set' : 'Not set',
      SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'Not set',
      SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME || 'Not set',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not set'
    };

    console.log('Environment check:', envCheck);

    if (!process.env.SENDGRID_API_KEY) {
      return Response.json({
        success: false,
        error: "SendGrid API key not configured",
        envCheck
      });
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      return Response.json({
        success: false,
        error: "SendGrid FROM email not configured",
        envCheck
      });
    }

    // Initialize SendGrid with detailed logging
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Create a simple test message
    const msg = {
      to: testEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Spitfire Elite Aviation'
      },
      subject: "🔧 SendGrid Debug Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ea580c;">🔧 SendGrid Debug Test</h2>
          
          <p>This is a debug test email to verify SendGrid configuration.</p>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration Details</h3>
            <ul>
              <li><strong>From Email:</strong> ${process.env.SENDGRID_FROM_EMAIL}</li>
              <li><strong>From Name:</strong> ${process.env.SENDGRID_FROM_NAME || 'Default'}</li>
              <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
              <li><strong>API Key Length:</strong> ${process.env.SENDGRID_API_KEY?.length} characters</li>
            </ul>
          </div>
          
          <p>If you received this email, your basic SendGrid setup is working! ✅</p>
        </div>
      `,
      text: `SendGrid Debug Test - Sent at ${new Date().toISOString()}`
    };

    console.log('Attempting to send email with config:', {
      to: testEmail,
      from: msg.from,
      apiKeyLength: process.env.SENDGRID_API_KEY?.length
    });

    try {
      const response = await sgMail.send(msg);
      console.log('SendGrid response:', response[0].statusCode, response[0].headers);
      
      return Response.json({
        success: true,
        message: "Debug email sent successfully",
        statusCode: response[0].statusCode,
        messageId: response[0].headers['x-message-id'],
        envCheck
      });
    } catch (sendError: any) {
      console.error('SendGrid send error:', sendError);
      console.error('SendGrid error details:', {
        code: sendError.code,
        message: sendError.message,
        response: sendError.response?.body
      });

      return Response.json({
        success: false,
        error: sendError.message,
        code: sendError.code,
        details: sendError.response?.body || 'No additional details',
        envCheck
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
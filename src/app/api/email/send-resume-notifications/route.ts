import { NextRequest } from "next/server";
import { getUser } from "@/lib/getUser";
import sgMail from '@sendgrid/mail';

interface EmailNotificationRequest {
  pilotName: string;
  pilotEmail: string;
  airline: string;
  position?: string;
  selectedTemplates?: string[];
}

// Simple email sending function with better error handling
const sendSimpleEmail = async (to: string, subject: string, html: string, text?: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.log('SendGrid FROM email not configured');
    return { success: false, error: 'SendGrid FROM email not configured' };
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Spitfire Elite Aviation'
      },
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    console.log('Sending email:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    
    return { 
      success: true, 
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    console.error('SendGrid error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.body
    });
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.response?.body
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: EmailNotificationRequest = await request.json();
    const { pilotName, pilotEmail, airline, position, selectedTemplates } = body;

    if (!pilotName || !pilotEmail || !airline) {
      return Response.json(
        { success: false, error: "Missing required fields: pilotName, pilotEmail, airline" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(pilotEmail)) {
      return Response.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    console.log('Processing email notifications for:', { pilotName, pilotEmail, airline });

    // Create simplified email content
    const pilotEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ea580c;">Spitfire Elite Aviation</h1>
        <h2 style="color: #ea580c;">Thank you for your resume submission!</h2>
        
        <p>Dear <strong>${pilotName}</strong>,</p>
        
        <p>We have successfully received your resume submission with the following details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Submission Details</h3>
          <ul>
            <li><strong>Airline:</strong> ${airline}</li>
            ${position ? `<li><strong>Position:</strong> ${position}</li>` : ''}
            ${selectedTemplates?.length ? `<li><strong>Selected Templates:</strong> ${selectedTemplates.filter(t => t).join(', ')}</li>` : ''}
            <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        
        <p>Our expert team will carefully review your application and get back to you soon.</p>
        
        <p>Best regards,<br>
        <strong>The Spitfire Elite Aviation Team</strong></p>
      </div>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@spitfirepremier.com';
    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dashboard.spitfirepremier.com';
    
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #ea580c;">🎯 New Resume Submission</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #333;">Pilot Information</h2>
          <ul>
            <li><strong>👤 Name:</strong> ${pilotName}</li>
            <li><strong>📧 Email:</strong> ${pilotEmail}</li>
            <li><strong>✈️ Airline:</strong> ${airline}</li>
            ${position ? `<li><strong>💼 Position:</strong> ${position}</li>` : ''}
            ${selectedTemplates?.length ? `<li><strong>📄 Templates:</strong> ${selectedTemplates.filter(t => t).join(', ')}</li>` : ''}
            <li><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}/resume-requests" 
             style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
             🚀 Review in Dashboard
          </a>
        </div>
      </div>
    `;

    // Send emails sequentially with detailed logging
    const results = {
      pilotEmailSent: false,
      adminEmailSent: false,
      errors: [] as string[]
    };

    // Send pilot confirmation email
    console.log('Sending pilot confirmation email...');
    const pilotResult = await sendSimpleEmail(
      pilotEmail,
      'Resume Submission Confirmation - Spitfire Elite Aviation',
      pilotEmailHtml
    );

    if (pilotResult.success) {
      results.pilotEmailSent = true;
      console.log('Pilot email sent successfully');
    } else {
      results.errors.push(`Pilot email failed: ${pilotResult.error}`);
      console.error('Pilot email failed:', pilotResult);
    }

    // Send admin notification email
    console.log('Sending admin notification email...');
    const adminResult = await sendSimpleEmail(
      adminEmail,
      `🎯 New Resume Submission - ${pilotName}`,
      adminEmailHtml
    );

    if (adminResult.success) {
      results.adminEmailSent = true;
      console.log('Admin email sent successfully');
    } else {
      results.errors.push(`Admin email failed: ${adminResult.error}`);
      console.error('Admin email failed:', adminResult);
    }

    const response = {
      success: results.pilotEmailSent || results.adminEmailSent, // Success if at least one email sent
      ...results
    };

    console.log('Email notification results:', response);
    return Response.json(response);

  } catch (error: any) {
    console.error('Error in email notifications endpoint:', error);
    return Response.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
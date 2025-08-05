import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key not found');
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export const sendEmail = async (emailData: EmailData) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email');
    return { success: false, error: 'SendGrid not configured' };
  }

  try {
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME || 'Spitfire Elite Aviation'
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      ...(emailData.templateId && {
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.dynamicTemplateData
      })
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    return { 
      success: false, 
      error: error.response?.body?.errors?.[0]?.message || error.message 
    };
  }
};

// Enhanced resume submission confirmation with more details
export const sendResumeSubmissionConfirmation = async (
  email: string, 
  name: string, 
  airline: string,
  position?: string,
  selectedTemplates?: string[]
) => {
  return sendEmail({
    to: email,
    subject: 'Resume Submission Confirmation - Spitfire Elite Aviation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ea580c; margin: 0;">Spitfire Elite Aviation</h1>
        </div>
        
        <h2 style="color: #ea580c;">Thank you for your resume submission!</h2>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>We have successfully received your resume submission with the following details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Submission Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Airline:</strong> ${airline}</li>
            ${position ? `<li style="margin: 10px 0;"><strong>Position:</strong> ${position}</li>` : ''}
            ${selectedTemplates?.length ? `<li style="margin: 10px 0;"><strong>Selected Templates:</strong> ${selectedTemplates.filter(t => t).join(', ')}</li>` : ''}
            <li style="margin: 10px 0;"><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</li>
          </ul>
        </div>
        
        <p>Our expert team will carefully review your application and get back to you soon. We appreciate your interest in working with <strong>${airline}</strong>.</p>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What's Next?</strong></p>
          <p style="margin: 5px 0;">Our team will review your resume and tailor it specifically for your target airline. You can expect to hear from us within 1-2 business days.</p>
        </div>
        
        <p>If you have any questions or need to make changes to your submission, please don't hesitate to contact us.</p>
        
        <br>
        <p>Best regards,<br>
        <strong>The Spitfire Elite Aviation Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          This is an automated confirmation email. Please do not reply to this email.<br>
          For support, please contact us through our website.
        </p>
      </div>
    `,
    text: `Thank you for your resume submission! Dear ${name}, we have received your resume submission for ${airline}${position ? ` for the position of ${position}` : ''}. Our team will review your application and get back to you soon. Best regards, Spitfire Elite Aviation Team`
  });
};

// Enhanced admin notification with more structured information
export const sendAdminResumeNotification = async (
  name: string, 
  email: string, 
  airline: string,
  position?: string,
  selectedTemplates?: string[]
) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@spitfirepremier.com';
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dashboard.spitfirepremier.com';
  
  return sendEmail({
    to: adminEmail,
    subject: `🎯 New Resume Submission - ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🎯 New Resume Submission</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Action required - Review and process</p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 30px;">
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin-top: 0; color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Pilot Information</h2>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">👤 Name:</span>
                <span style="font-size: 16px; font-weight: 600; color: #333;">${name}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">📧 Email:</span>
                <span style="color: #ea580c; font-weight: 500;">${email}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">✈️ Airline:</span>
                <span style="font-weight: 600; color: #333;">${airline}</span>
              </div>
              
              ${position ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">💼 Position:</span>
                <span style="font-weight: 500; color: #333;">${position}</span>
              </div>
              ` : ''}
              
              ${selectedTemplates?.length ? `
              <div style="display: flex; align-items: flex-start;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">📄 Templates:</span>
                <span style="color: #333;">${selectedTemplates.filter(t => t).join(', ')}</span>
              </div>
              ` : ''}
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #666; min-width: 120px;">🕐 Submitted:</span>
                <span style="color: #333;">${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #856404;">⚡ Quick Actions Required</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
              <li>Review the pilot's complete resume data</li>
              <li>Generate and customize resume for ${airline}</li>
              <li>Update submission status</li>
              <li>Send completed resume to pilot</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}/resume-requests" 
               style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: 600;
                      box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
                      transition: all 0.3s ease;">
               🚀 Review in Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              💡 <strong>Pro Tip:</strong> Respond quickly to maintain high client satisfaction. 
              Aim to process submissions within 24 hours.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #999;">
            This is an automated notification from the Resume Builder system.<br>
            Generated at ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `,
    text: `New Resume Submission from ${name} (${email}) for ${airline}${position ? ` - Position: ${position}` : ''}. Submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}. Please review in the admin dashboard: ${dashboardUrl}/resume-requests`
  });
};

// Utility functions for common email types
export const sendResumeSubmissionConfirmation_OLD = async (
  email: string, 
  name: string, 
  airline: string
) => {
  return sendEmail({
    to: email,
    subject: 'Resume Submission Confirmation - Spitfire Elite Aviation',
    html: `
      <h2>Thank you for your resume submission!</h2>
      <p>Dear ${name},</p>
      <p>We have received your resume submission for <strong>${airline}</strong>.</p>
      <p>Our team will review your application and get back to you soon.</p>
      <br>
      <p>Best regards,<br>
      Spitfire Elite Aviation Team</p>
    `
  });
};

export const sendAdminNotification = async (
  name: string, 
  email: string, 
  airline: string,
  position: string
) => {
  return sendEmail({
    to: process.env.ADMIN_EMAIL!,
    subject: `New Resume Submission - ${name}`,
    html: `
      <h2>New Resume Submission</h2>
      <p><strong>Pilot:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Airline:</strong> ${airline}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <br>
      <p>Please review the submission in the admin dashboard.</p>
    `
  });
};

export const sendStatusUpdate = async (
  email: string,
  name: string,
  status: string,
  message?: string
) => {
  const statusMessages = {
    'processing': 'Your resume is currently being processed.',
    'approved_and_sent': 'Your resume has been approved and sent to the airline!',
    'needs_review': 'Your resume requires additional review.'
  };

  return sendEmail({
    to: email,
    subject: `Resume Status Update - ${status.replace('_', ' ').toUpperCase()}`,
    html: `
      <h2>Resume Status Update</h2>
      <p>Dear ${name},</p>
      <p>${statusMessages[status as keyof typeof statusMessages] || 'Your resume status has been updated.'}</p>
      ${message ? `<p><strong>Additional notes:</strong> ${message}</p>` : ''}
      <br>
      <p>Best regards,<br>
      Spitfire Elite Aviation Team</p>
    `
  });
};
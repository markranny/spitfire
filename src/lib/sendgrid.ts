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

// Utility functions for common email types
export const sendResumeSubmissionConfirmation = async (
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
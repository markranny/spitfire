// import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
// import fs from 'fs';
// import path from 'path';
// import { Education, ProfessionalExperience, ResumeFields, VolunteerAndLeadershipActivities } from "../../types/api/requests";

// export const generateTemplate3 = async (
//     resumeData: ResumeFields,
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     width: number,
//     height: number,
//     boldFont: any,
//     italicFont: any,
//     customFont: any,
//     yPosition: number,
// ) => {
//     // Professional Experience Section
//     yPosition = await drawProfessionalExperienceSection(resumeData, pdfDoc, page, yPosition, width, boldFont, customFont);

//     // Volunteer Experience Section
//     if (resumeData.volunteerAndLeadershipActivities) {
//         yPosition = await drawVolunteerExperienceSection(resumeData.volunteerAndLeadershipActivities, pdfDoc, page, yPosition, boldFont, customFont);
//     }

//     // Education Section
//     if (resumeData.education) {
//         yPosition = await drawEducationSection(resumeData.education, pdfDoc, page, yPosition, boldFont, italicFont, customFont);
//     }

//     return pdfDoc; // Return the modified PDF document
// };

// // Define spacing values
// const SPACING = {
//     headerToContent: 20,   // Space between section headers and first content line
//     lineSpacing: 14,      // Space between each content line
//     sectionSpacing: 35,   // Space between different sections
// };

// const INDENTATION = {
//     header: 40,   // Space between different sections
//     bullet: 45,
// };

// // Function to draw underlined text
// const drawUnderlinedText = (page: PDFPage, text: string, x: number, y: number, font: any, size: number) => {
//     page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });

//     const textWidth = font.widthOfTextAtSize(text, size);
//     page.drawLine({
//         start: { x, y: y - 2 },
//         end: { x: x + textWidth, y: y - 2 },
//         color: rgb(0, 0, 0),
//         thickness: 0.5,
//     });

//     return y - 14; // Return new Y position for consistent spacing
// };
// // Function to draw italicized text
// const drawItalicizedText = (page: PDFPage, text: string, x: number, y: number, italicFont: any, size: number) => {
//     page.drawText(text, { x, y, size, font: italicFont, color: rgb(0, 0, 0) });
//     return y - 14;
// };

// // Function to draw section headers
// const drawSectionHeader = (page: PDFPage, title: string, x: number, y: number, font: any) => {
//     page.drawText(title, { x, y, size: 12, font, color: rgb(0, 0, 0) });
//     return y - SPACING.headerToContent;
// };

// // Function to draw bullet points
// const drawBulletPoint = (page: PDFPage, text: string, x: number, y: number, font: any, size: number) => {
//     page.drawText(`• ${text}`, { x, y, size, font, color: rgb(0, 0, 0) });
//     return y - 15; // Return new Y position for spacing
// };

// // Function to draw underlined bold text (for organization names)
// const drawUnderlinedBoldText = (page: PDFPage, text: string, x: number, y: number, boldFont: any, size: number) => {
//     page.drawText(text, { x, y, size, font: boldFont, color: rgb(0, 0, 0) });

//     const textWidth = boldFont.widthOfTextAtSize(text, size);
//     page.drawLine({
//         start: { x, y: y - 2 },
//         end: { x: x + textWidth, y: y - 2 },
//         color: rgb(0, 0, 0),
//         thickness: 0.5,
//     });

//     return y - 14;
// };

// // Function to draw bold text 
// const drawBoldText = (page: PDFPage, text: string, x: number, y: number, boldFont: any, size: number) => {
//     page.drawText(text, { x, y, size, font: boldFont, color: rgb(0, 0, 0) });
//     return y - 14;
// };

// // Function to draw divider / horizontal line
// const drawDivider = (page: PDFPage, yPosition: number) => {
//     page.drawLine({
//         start: { x: 40, y: yPosition + 15 },
//         end: { x: page.getWidth() - 40, y: yPosition + 15 },
//         thickness: .01,
//         color: rgb(0, 0, 0),
//     });

//     return yPosition - 10; // Adjust spacing after the line
// };


// // Function to draw professional experience section
// const addProfessionalExperience = async (
//     experience: ProfessionalExperience[],
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     width: number,
//     boldFont: any,
//     customFont: any
// ) => {
//     for (const exp of experience) {
//         if (exp.prev_company && exp.prev_job_title && exp.prev_dates_employment) {
//             // Format text
//             const companyText = exp.prev_company;
//             const positionAircraft = `${exp.prev_job_title} - ${exp.prev_aircraft}`;
//             const employmentDateText = exp.prev_dates_employment;
//             const employentlocation = `${exp.prev_job_city}, ${exp.prev_job_state}`;
//             // Draw underlined company & position
//             yPosition = drawUnderlinedText(page, companyText, 45, yPosition, boldFont, 11);

//             // Right-align employment location 
//             const employmentLocWidth = boldFont.widthOfTextAtSize(employentlocation, 11);
//             page.drawText(employentlocation, {
//                 x: width - employmentLocWidth - 50, // Right-aligned
//                 y: yPosition + 14, // Align with company text
//                 size: 11,
//                 font: boldFont,
//                 color: rgb(0, 0, 0),
//             });

//             yPosition = drawBoldText(page, positionAircraft, 45, yPosition, boldFont, 11);

//             // Right-align employment date 
//             const employmentDatecWidth = boldFont.widthOfTextAtSize(employmentDateText, 11);
//             page.drawText(employmentDateText, {
//                 x: width - employmentDatecWidth - 50, // Right-aligned
//                 y: yPosition + 14, // Align with company text
//                 size: 11,
//                 font: boldFont,
//                 color: rgb(0, 0, 0),
//             });
//             // Add key role, highlighted roles, and aircraft type
//             if (exp.prev_keyrole) yPosition = drawBulletPoint(page, exp.prev_keyrole, INDENTATION.bullet, yPosition, customFont, 11);
//             if (exp.highlight_roles_exp) yPosition = drawBulletPoint(page, exp.highlight_roles_exp, INDENTATION.bullet, yPosition, customFont, 11);
//             yPosition -= SPACING.lineSpacing; // Space between job entries
//         }
//     }

//     return yPosition;
// };

// // Education Section
// export const drawEducationSection = async (
//     education: Education[],
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     boldFont: any,
//     italicFont: any,
//     customFont: any
// ) => {
//     if (education && education.length > 0) {
//         // Draw section header
//         yPosition = drawSectionHeader(page, "EDUCATION", INDENTATION.header, yPosition, boldFont);
//         yPosition = drawDivider(page, yPosition);

//         // Draw "Degree, School Name" in bold
//         for (const educ of education) {
//             const startX = 45; // Adjust starting position
//             let currentX = startX;
//             const educationText = `${educ.degree}, ${educ.school_name}`;
//             page.drawText(educationText, {
//                 x: currentX,
//                 y: yPosition,
//                 size: 11,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
    
//             // Calculate width of the degree and school name
//             const educationTextWidth = boldFont.widthOfTextAtSize(educationText, 11);
//             currentX += educationTextWidth + 5; // Add extra spacing
    
//             // Append City & State in bold
//             if (educ.college_city && educ.college_state) {
//                 const locationText = `- ${educ.college_city}, ${educ.college_state}`;
//                 page.drawText(locationText, {
//                     x: currentX,
//                     y: yPosition,
//                     size: 11,
//                     font: customFont,
//                     color: rgb(0, 0, 0),
//                 });
//             }
//             // Move down for next content
//             yPosition -= SPACING.lineSpacing;
//         }
//     }

//     return yPosition;
// };


// // Professional Experience
// export const drawProfessionalExperienceSection = async (
//     resumeData: any,
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     width: number,
//     boldFont: any,
//     customFont: any
// ) => {
//     if (resumeData.professionalExperience && resumeData.professionalExperience.length > 0) {
//         yPosition = drawSectionHeader(page, "PROFESSIONAL EXPERIENCE", INDENTATION.header, yPosition - 10, boldFont);
//         yPosition = drawDivider(page, yPosition);

//         return await addProfessionalExperience(resumeData.professionalExperience, pdfDoc, page, yPosition, width, boldFont, customFont);
//     }

//     return yPosition;
// };

// // Volunteer Experience
// export const drawVolunteerExperienceSection = async (volunteerExperience: VolunteerAndLeadershipActivities, pdfDoc: PDFDocument, page: PDFPage, yPosition: number, boldFont: any, customFont: any) => {
//     if (volunteerExperience) {
//         yPosition = drawSectionHeader(page, "VOLUNTEER EXPERIENCE", INDENTATION.header, yPosition, boldFont);
//         yPosition = drawDivider(page, yPosition);

//         if (volunteerExperience.has_volunteer_role && volunteerExperience.volunteer_roles) {
//             for (const exp of volunteerExperience.volunteer_roles) {
//                 if (exp.volunteer_organization) {
//                     // TODO: Confirm this: const volunteerTitle = `${exp.volunteer_organization} - ${exp.aviation_volunteer_city}, ${exp.aviation_volunteer_state}`;
//                     const volunteerTitle = `${exp.volunteer_organization}`;
//                     yPosition = drawBoldText(page, volunteerTitle, 45, yPosition, boldFont, 11);

//                     if (exp.volunteer_role) yPosition = drawBulletPoint(page, exp.volunteer_role, 60, yPosition, customFont, 11);
//                     if (exp.volunteer_responsibilities) yPosition = drawBulletPoint(page, exp.volunteer_responsibilities, 60, yPosition, customFont, 11);
//                     yPosition -= SPACING.lineSpacing;
//                 }
//             }
//         }
//     }

//     return yPosition;
// };


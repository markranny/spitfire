// import { PDFDocument, PDFField, PDFFont, PDFPage, rgb } from 'pdf-lib';
// import fs from 'fs';
// import path from 'path';
// import { AdditionalInformation, Education, ProfessionalExperience, ResumeFields, VolunteerAndLeadershipActivities } from "../../types/api/requests";

// export const generateTemplate5 = async (
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
//     if (resumeData.professionalExperience) { 
//         yPosition = await drawProfessionalExperienceSection(resumeData, pdfDoc, page, yPosition, width, boldFont, customFont);
//     }
//     // Attainment  Section
//     if (resumeData.additionalInformation) {
//         yPosition = await drawAttainmentSection(page, yPosition, boldFont, italicFont, customFont, resumeData.additionalInformation);
//     }

//     // Volunteer Experience Section
//     if (resumeData.volunteerAndLeadershipActivities) {
//         yPosition = await drawVolunteerExperienceSection(resumeData.volunteerAndLeadershipActivities, pdfDoc, page, yPosition, boldFont, customFont);
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
//     bullet: 42,
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
//     page.drawText(`-\t${text}`, { x, y, size, font, color: rgb(0, 0, 0) });
//     return y - 15; // Return new Y position for spacing
// };

// // Function to draw divider / horizontal line
// const drawDivider = (page: PDFPage, yPosition: number) => {
//     page.drawLine({
//         start: { x: 35, y: yPosition },
//         end: { x: page.getWidth() - 40, y: yPosition },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//     });

//     return yPosition - 10; // Adjust spacing after the line
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

// // Function to draw custom font
// const drawCustomFont = (page: PDFPage, text: string, x: number, y: number, customFont: PDFFont, size: number) => {
//     page.drawText(text, { x, y, size, font: customFont, color: rgb(0, 0, 0) });
//     return y - 14;
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
//             const companyPositionText = ` ${exp.prev_job_title} - ${exp.prev_aircraft}:  ${exp.prev_company}`;
//             const employmentDateText = exp.prev_dates_employment;

//             // Draw company & position
//             yPosition = drawBoldText(page, companyPositionText, INDENTATION.bullet, yPosition, boldFont, 11);

//             // Right-align employment dates
//             const textWidth = boldFont.widthOfTextAtSize(employmentDateText, 11);
//             yPosition = drawUnderlinedBoldText(page, employmentDateText, width - textWidth - 42, yPosition + 14, boldFont, 11);
//             const employmentloc = `${exp.prev_job_city || ""}, ${exp.prev_job_state || ""}`.trim();
//             const employmentLocwidth = boldFont.widthOfTextAtSize(employmentloc, 11);
           
//             // Draw Location (Below the Date)
//             page.drawText(employmentloc, {
//                 x: width - employmentLocwidth - 42,
//                 y: yPosition, // Move down slightly
//                 size: 11,
//                 font: customFont,
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

// // Attainment
// export const drawAttainmentSection = async (
//     page: PDFPage,
//     yPosition: number,
//     boldFont: any,
//     italicFont: any,
//     customFont: any,
//     attainment?: AdditionalInformation,
// ) => {
//     if (attainment) {
//         // Draw section header
//         yPosition -= 10;
//         drawSectionHeader(page, "ATTAINMENTS:", INDENTATION.header, yPosition, boldFont);

//         // Draw Attainment
//         if (attainment.awards)  {
//             yPosition = drawCustomFont(page, attainment.awards, 140, yPosition, customFont, 11);
//         }
//         if (attainment.personal_achievements)  {
//             yPosition = drawCustomFont(page, attainment.personal_achievements, 140, yPosition, customFont, 11);
//         }
//         if (attainment.recognitions)  {
//             yPosition = drawCustomFont(page, attainment.recognitions, 140, yPosition, customFont, 11);
//         }


//         yPosition -= SPACING.sectionSpacing; // Ensure proper spacing before the next section
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
//         yPosition = drawDivider(page, yPosition);

//         yPosition = drawSectionHeader(page, "EXPERIENCE:", INDENTATION.header, yPosition - 10, boldFont);

//         return await addProfessionalExperience(resumeData.professionalExperience, pdfDoc, page, yPosition, width, boldFont, customFont);
//     }

//     return yPosition;
// };

// // Volunteer Experience
// export const drawVolunteerExperienceSection = async (volunteerExperience: VolunteerAndLeadershipActivities, pdfDoc: PDFDocument, page: PDFPage, yPosition: number, boldFont: any, customFont: any) => {
//     if (volunteerExperience) {
//         drawSectionHeader(page, "VOLUNTEER:", INDENTATION.header, yPosition, boldFont);
//         if (volunteerExperience.has_volunteer_role && volunteerExperience.volunteer_roles) {
//             const volunteerOrganizations = volunteerExperience.volunteer_roles
//             .map(exp => `${exp.volunteer_role} of ${exp.volunteer_organization}`)
//             .filter(role => role) // Remove any undefined or empty values
//             .join(", ");

//             yPosition = drawCustomFont(page, volunteerOrganizations, 140, yPosition, customFont, 11);
//             yPosition -= SPACING.lineSpacing;            
//         }
//     }

//     return yPosition;
// };


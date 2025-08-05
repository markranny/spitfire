// import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';
// import { ResumeFields, ProfessionalExperience, Education, VolunteerAndLeadershipActivities } from "../../types/api/requests";

// // Define text formatting settings
// const SPACING = {
//     sectionTitle: 20,   // Space between section title and content
//     entrySpacing: 30,   // Space between each entry
//     lineSpacing: 14,    // Space between lines in an entry
//     sectionSpacing: 30, // Space between sections
// };

// const INDENTATION = {
//     sectionHeader: 40,
//     content: 143,
// };

// // Function to generate Template 2
// export const generateTemplate2 = async (
//     resumeData: ResumeFields,
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     width: number,
//     height: number,
//     boldFont: PDFFont,
//     italicFont: PDFFont,
//     customFont: PDFFont,
//     yPosition: number,
// ) => {
//     // 1. Professional Experience Section
//     if (resumeData.professionalExperience && resumeData.professionalExperience.length > 0) {
//         yPosition = await drawProfessionalExperienceSection(resumeData.professionalExperience, pdfDoc, page, yPosition, width, boldFont, customFont, italicFont);
//     }

//     // 2. Education Section
//     if (resumeData.education) {
//         yPosition = await drawEducationSection(resumeData.education, pdfDoc, page, yPosition, boldFont, italicFont, customFont, width);
//     }

//     // 3. Professional Training Section
//     if (resumeData.education && resumeData.education.length > 0) {
//         yPosition = await drawProfessionalTrainingSection(resumeData.education, pdfDoc, page, yPosition, boldFont, customFont);
//     }

//     // 4. Activities Section
//     if (resumeData.volunteerAndLeadershipActivities) {
//         yPosition = await drawActivitiesSection(resumeData.volunteerAndLeadershipActivities, pdfDoc, page, yPosition, boldFont, customFont);
//     }

//     return pdfDoc; // Return the modified PDF document
// };

// const drawProfessionalExperienceSection = async (
//     experienceData: ProfessionalExperience[],
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     width: number,
//     boldFont: PDFFont,
//     customFont: PDFFont,
//     italicFont: PDFFont,
// ) => {
//     const { sectionTitle, entrySpacing, lineSpacing, sectionSpacing } = SPACING;
//     let y = yPosition;

//     if (!experienceData || experienceData.length === 0) return y;

//     page.drawText("EXPERIENCE:", {
//         x: INDENTATION.sectionHeader,
//         y,
//         size: 12,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//     });
//     y -= sectionTitle;

//     for (const experience of experienceData) {
//         let linesDrawn = false;

//         if (experience.prev_dates_employment) {
//             page.drawText(experience.prev_dates_employment, {
//                 x: INDENTATION.sectionHeader,
//                 y,
//                 size: 10,
//                 font: italicFont,
//                 color: rgb(0, 0, 0),
//             });
//             linesDrawn = true;
//         }

//         if (experience.prev_job_title || experience.prev_company) {
//             page.drawText(
//                 `${experience.prev_job_title || ""} | ${experience.prev_company || ""}`.trim(),
//                 {
//                     x: INDENTATION.content,
//                     y,
//                     size: 10,
//                     font: boldFont,
//                     color: rgb(0, 0, 0),
//                 }
//             );
//             linesDrawn = true;
//         }

//         if (experience.prev_job_city || experience.prev_job_state) {
//             page.drawText(
//                 `${experience.prev_job_city || ""}, ${experience.prev_job_state || ""}`.trim(),
//                 {
//                     x: width - 150,
//                     y,
//                     size: 10,
//                     font: boldFont,
//                     color: rgb(0, 0, 0),
//                 }
//             );
//             linesDrawn = true;
//         }

//         if (linesDrawn) y -= lineSpacing;

//         if (experience.highlight_roles_exp) {
//             page.drawText(experience.highlight_roles_exp, {
//                 x: INDENTATION.content,
//                 y,
//                 size: 10,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
//             y -= entrySpacing;
//         }
//     }

//     return y - sectionSpacing;
// };

// const drawEducationSection = async (
//     educationData: Education[],
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     boldFont: PDFFont,
//     italicFont: PDFFont,
//     customFont: PDFFont,
//     width: number
// ) => {
//     const { sectionTitle, lineSpacing, sectionSpacing } = SPACING;
//     let y = yPosition;

//     if (educationData && educationData.length == 0) return y;

//     page.drawText("EDUCATION:", {
//         x: INDENTATION.sectionHeader,
//         y,
//         size: 12,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//     });
    
        
//     for (const educ of educationData) {
//         if (educ.school_name || educ.college_city || educ.college_state) {
//             page.drawText(
//                 `${educ.school_name || ""}, ${educ.college_city || ""}, ${educ.college_state || ""}`.trim(),
//                 {
//                     x: INDENTATION.content,
//                     y,
//                     size: 10,
//                     font: boldFont,
//                     color: rgb(0, 0, 0),
//                 }
//             );
//             y -= lineSpacing;
//         }
    
//         if (educ.degree || educ.honors || educ.gpa) {
//             page.drawText(
//                 `${educ.degree || ""} | ${educ.honors || ""} | ${educ.gpa || ""}`.trim(),
//                 {
//                     x: INDENTATION.content,
//                     y,
//                     size: 10,
//                     font: customFont,
//                     color: rgb(0, 0, 0),
//                 }
//             );
//         }
//         y -= lineSpacing;
//     }
    
//     return y - sectionSpacing;
 
// };

// const drawProfessionalTrainingSection = async (
//     trainingData: Education[],
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     boldFont: PDFFont,
//     customFont: PDFFont
// ) => {
//     const { sectionTitle, lineSpacing, sectionSpacing } = SPACING;
//     let y = yPosition;
//     let hasContent = false;
//     if (trainingData && trainingData.length > 0) {
//         page.drawText("PROFESSIONAL\nTRAINING:", {
//             x: INDENTATION.sectionHeader,
//             y,
//             size: 12,
//             font: boldFont,
//             color: rgb(0, 0, 0),
//         });
//     }
//     for (const training of trainingData) {
//         if (training.add_training_1) {
//             page.drawText(training.add_training_1, {
//                 x: INDENTATION.content,
//                 y,
//                 size: 10,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
//             y -= lineSpacing;
//             hasContent = true;
//         }
    
//         if (training.add_training_2) {
//             page.drawText(training.add_training_2, {
//                 x: INDENTATION.content,
//                 y,
//                 size: 10,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
//             y -= lineSpacing;
//             hasContent = true;
//         }
    
//         if (training.add_training_3) {
//             page.drawText(training.add_training_3, {
//                 x: INDENTATION.content,
//                 y,
//                 size: 10,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
//             y -= lineSpacing;
//             hasContent = true;
//         }
//     }
   

//     return hasContent ? y - sectionSpacing : y;
// };

// const drawActivitiesSection = async (
//     activitiesData: VolunteerAndLeadershipActivities,
//     pdfDoc: PDFDocument,
//     page: PDFPage,
//     yPosition: number,
//     boldFont: PDFFont,
//     customFont: PDFFont
// ) => {
//     const { sectionTitle, lineSpacing, sectionSpacing } = SPACING;
//     let y = yPosition;
//     let hasContent = false;

//     if (activitiesData && activitiesData.has_volunteer_role && activitiesData.volunteer_roles?.length) {
//         page.drawText("ACTIVITIES:", {
//             x: INDENTATION.sectionHeader,
//             y,
//             size: 12,
//             font: boldFont,
//             color: rgb(0, 0, 0),
//         });
//     }

//     activitiesData.volunteer_roles?.forEach((activity) => {
//         if (activity.volunteer_organization) {
//             page.drawText(activity.volunteer_organization, {
//                 x: INDENTATION.content,
//                 y,
//                 size: 10,
//                 font: customFont,
//                 color: rgb(0, 0, 0),
//             });
//             y -= lineSpacing;
//             hasContent = true;
//         }
//     });

//     return hasContent ? y - sectionSpacing : y;
// };


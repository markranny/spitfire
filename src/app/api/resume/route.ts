import { NextRequest, NextResponse } from "next/server";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { ProfessionalExperience, ResumeFields } from "@/types/api/requests";
import path from "path";
import fs from "fs";
import { fieldMappings, FieldMappingFunction } from "../../mappings/fieldMappings";
import { TemplateHandler } from "easy-template-x";
import { mapResumeDataToTemplate } from "@/app/mappings/fieldMappingsDoc";
import { getUser } from "@/lib/getUser";
import { db } from "@/db/drizzle/db";
import { resumes } from "@/db/drizzle/schema/resume";
import { eq } from "drizzle-orm";

/**
 * Helper function to check if a field value is empty
 */
const isEmpty = (value: any): boolean => {
  return value === undefined || value === null || value.toString().trim() === "";
};

const formatValue = (value: any): string => {
  return isEmpty(value) ? "" : value.toString();
};

enum ResumeTemplate {
  TEMPLATE_1 = "1",
  TEMPLATE_2 = "2",
  TEMPLATE_3 = "3",
  TEMPLATE_4 = "4",
  TEMPLATE_5 = "5",
}

enum FileType {
  PDF = "pdf",
  DOCX = "docx",
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template");
  const fileType = searchParams.get("fileType"); // values: "pdf" | "docx" > refer to FileTypeEnum

  if (!template) {
    return Response.json({ error: "Template parameter is required" }, { status: 400 });
  } else if (!Object.values(ResumeTemplate).includes(template as ResumeTemplate)) {
    return Response.json({ error: "Unknown template" }, { status: 400 });
  }

  if (!fileType) {
    return Response.json({ error: "fileType parameter is required" }, { status: 400 });
  } else if (!Object.values(FileType).includes(fileType as FileType)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), { status: 405 });
  }

  try {
    const resumeData: ResumeFields = await req.json();
    const selectedMapping = { ...fieldMappings[template] };

    if (fileType === FileType.PDF) {
      // Load the PDF template
      const templatePath = path.join(process.cwd(), `public/Template ${template}`, `SpitfireTemplate_${template}.pdf`);
      const templateBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(templateBytes);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // Register font
      pdfDoc.registerFontkit(fontkit);
      const boldFont = await pdfDoc.embedFont(
        fs.readFileSync(path.join(process.cwd(), "public/fonts", "TimesNewRoman-Bold.ttf"))
      );
      const italicFont = await pdfDoc.embedFont(
        fs.readFileSync(path.join(process.cwd(), "public/fonts", "TimesNewRoman-Italic.ttf"))
      );
      const customFont = await pdfDoc.embedFont(
        fs.readFileSync(path.join(process.cwd(), "public/fonts", "TimesNewRoman.ttf"))
      );

      // Fill static and required fields
      const form = pdfDoc.getForm();
      const existingFields = form.getFields().map((field) => field.getName());
      Object.entries(selectedMapping).forEach(([pdfField, valueFunction]: [string, FieldMappingFunction]) => {
        if (!existingFields.includes(pdfField)) {
          console.warn(`Skipping missing field: ${pdfField}`);
          return;
        }
        const field = form.getTextField(pdfField);
        const value: string = valueFunction(resumeData);
        if (value) {
          field.setText(value);
          field.updateAppearances(customFont);
        }
      });

      // Fill dynamic fields
      let yPosition = findLastUsedYPosition(pdfDoc, page, height);

      // TODO: Remove PDF code
      // Call the appropriate template function
      // await generateResumePDF(
      //   resumeData,
      //   template as ResumeTemplate,
      //   pdfDoc,
      //   page,
      //   width,
      //   height,
      //   boldFont,
      //   italicFont,
      //   customFont,
      //   yPosition
      // );

      form.flatten(); // Lock the filled fields

      // Generate and return the completed PDF
      const pdfBytes = await pdfDoc.save();
      return new Response(pdfBytes, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=generated_resume.pdf",
        },
      });
    } else if (fileType === FileType.DOCX) {
      // Generate and return the DOCX file
      const generateWordResumeFromTemplate = async (resumeData: ResumeFields) => {
        // Load the Word template
        const templatePath = path.join(
          process.cwd(),
          `public/Template ${template}`,
          `SpitfireTemplate_${template}.docx`
        );
        const content = fs.readFileSync(templatePath);
        const handler = new TemplateHandler();
        // Process and generate the Word document
        const doc = await handler.process(content, mapResumeDataToTemplate(resumeData));
        fs.writeFileSync(
          `${resumeData.personalInformation.last_name},${resumeData.personalInformation.first_name}.docx`,
          doc
        );

        const buffer = Buffer.from(doc);
        return new Response(buffer, {
          headers: {
            "Content-Disposition": "attachment; filename=resume.docx",
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        });
      };
      return generateWordResumeFromTemplate(resumeData);
    }
  } catch (error) {
    console.error("Error generating file:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }

  // Function to find the last occupied Y-position based on form field positions
  function findLastUsedYPosition(pdfDoc: PDFDocument, page: PDFPage, height: number): number {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (fields.length === 0) {
      return height - 50; // Default fallback if no fields exist
    }

    let lowestY = height; // Start from the top of the page

    fields.forEach((field) => {
      const widgets = field.acroField.getWidgets();
      widgets.forEach((widget) => {
        const rect = widget.getRectangle();
        if (rect && rect.y < lowestY) {
          lowestY = rect.y;
        }
      });
    });

    return lowestY - 10; // Adjust to start just below the last existing text
  }

  // async function generateResumePDF(
  //   resumeData: ResumeFields,
  //   template: ResumeTemplate,
  //   pdfDoc: PDFDocument,
  //   page: PDFPage,
  //   width: number,
  //   height: number,
  //   boldFont: PDFFont,
  //   italicFont: PDFFont,
  //   customFont: PDFFont,
  //   yPosition: number
  // ) {
  //   switch (template) {
  //     case ResumeTemplate.TEMPLATE_1:
  //       return await generateTemplate1(
  //         resumeData,
  //         pdfDoc,
  //         page,
  //         width,
  //         height,
  //         boldFont,
  //         italicFont,
  //         customFont,
  //         yPosition
  //       );
  //     case ResumeTemplate.TEMPLATE_2:
  //       return await generateTemplate2(
  //         resumeData,
  //         pdfDoc,
  //         page,
  //         width,
  //         height,
  //         boldFont,
  //         italicFont,
  //         customFont,
  //         yPosition
  //       );
  //     case ResumeTemplate.TEMPLATE_3:
  //       return await generateTemplate3(
  //         resumeData,
  //         pdfDoc,
  //         page,
  //         width,
  //         height,
  //         boldFont,
  //         italicFont,
  //         customFont,
  //         yPosition
  //       );
  //     case ResumeTemplate.TEMPLATE_4:
  //       return await generateTemplate4(
  //         resumeData,
  //         pdfDoc,
  //         page,
  //         width,
  //         height,
  //         boldFont,
  //         italicFont,
  //         customFont,
  //         yPosition
  //       );
  //     case ResumeTemplate.TEMPLATE_5:
  //       return await generateTemplate5(
  //         resumeData,
  //         pdfDoc,
  //         page,
  //         width,
  //         height,
  //         boldFont,
  //         italicFont,
  //         customFont,
  //         yPosition
  //       );
  //     default:
  //       throw new Error("Unsupported template type");
  //   }
  // }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 401 });
    }
    const resumeList = await db.select().from(resumes).where(eq(resumes.userId, user.id));
    
    return Response.json({
      success: true,
      resumeList,
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

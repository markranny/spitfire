"use client";

import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import React, { useRef, useState } from "react";
import PreviewCard from "./ExamplePreviewCard";
import PreviewModal from "./ExamplePreviewModal";
import { useAppSelector } from "@/state/redux";
import { dataMapper, downloadFile, ResumeData, ResumeTemplate } from "@/lib/utils";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtilsInterface from "pizzip/utils/index.js";
import { jsPDF } from "jspdf";
import mammoth from "mammoth";
import dynamic from "next/dynamic";
import { renderAsync } from "docx-preview";
import path from "path";
import fs from "fs";
import { TemplateHandler } from "easy-template-x";
import { mapResume, resumeDataField } from "@/app/mappings/fieldMappingsDoc";

type PizZipUtilsType = typeof PizZipUtilsInterface;
type PizZipCallback = typeof PizZipUtilsInterface.getBinaryContent;
let PizZipUtils: PizZipUtilsType | null = null;
if (typeof window !== "undefined") {
  import("pizzip/utils/index.js").then(function (r) {
    PizZipUtils = r as unknown as PizZipUtilsType;
  });
}

const loadFile: PizZipCallback = (url, callback) => {
  if (PizZipUtils) {
    PizZipUtils.getBinaryContent(url, callback);
  }
};

export interface GenerateDocumentResult {
  docx: Blob;
  pdf: Blob;
}

const generateDocument = async (
  template: ResumeTemplate,
  resumeData: ResumeData,
  containerRef: HTMLDivElement | null,
  callback: (result: GenerateDocumentResult) => void
) => {
  if (!containerRef) {
    throw new Error("Container reference is not available");
  }
  // TODO: Based on template param, select the right 'input' file
  loadFile(`/Template ${template}/SpitfireTemplate_${template}.docx`, async (error, content) => {
    if (error) {
      throw error;
    }
    const templatePath = path.join(process.cwd(), `/Template ${template}/SpitfireTemplate_${template}.docx`);
    const response = await fetch(templatePath);
    const templateContent = await response.arrayBuffer();
    if (!response.ok) {
        throw new Error("Failed to load template");
    }
    const handler = new TemplateHandler();
    // Process and generate the Word document
    const doc = await handler.process(templateContent, mapResume(resumeDataField, template));    
    const wordBlob = new Blob([doc], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    const buffer = Buffer.from(doc);
    await renderAsync(buffer, containerRef);
    const generatedHtml = containerRef.innerHTML;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });
    const sections = containerRef.getElementsByClassName("docx");
    let htmlContent = "";
    for (let section of sections) {
      htmlContent += section.outerHTML;
    }

    const pageWidth = pdf.internal.pageSize.getWidth(); // 612 pt for Letter
    const margin = 40;

    await pdf.html(htmlContent, {
      callback: (pdfDoc: jsPDF) => {
        const pdfBlob: Blob = pdfDoc.output("blob");
        callback({
          docx: wordBlob,
          pdf: pdfBlob,
        });
      },
      x: 0,
      y: 0,
      width: pageWidth,
      windowWidth: pageWidth,
      margin: [margin, margin, margin, margin],
      html2canvas: {
        scale: 0.65,
        width: pageWidth,
        windowWidth: pageWidth,
      },
      autoPaging: "text", // Enable auto-paging for long content
    });
  });
};

const ExamplePreview = () => {
  const [openPreview, setOpenPreview] = useState(false);
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dialogButtonRef = useRef<HTMLButtonElement>(null);
  const [activePreview, setActivePreview] = useState<ResumeTemplate>(ResumeTemplate.TEMPLATE_1);
  const [generateDocumentResult, setGenerateDocumentResult] = useState<GenerateDocumentResult | null>(null);
  const { formData } = useAppSelector((state) => state.global);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const handlePreview = (template: ResumeTemplate) => {
    handleGenerateResume(template);
    setActivePreview(template);
    if (!dialogButtonRef.current) return;
    dialogButtonRef.current.click();
    setOpenPreview(true);
  };

  const handleGenerateResume = async (
    template: ResumeTemplate,
    callback?: (result: GenerateDocumentResult) => void
  ) => {
    setGenerateDocumentResult(null);

    let resumeData: any = dataMapper(formData);
    if (resumeData?.personalInformation == null) {
      // Add sample data for testing
      resumeData = {
        personalInformation: {
          email: "michael@example.com",
          first_name: "Michael",
          last_name: "Example",
          phone_number: "312-333-4444",
          address_line_1: "123 Example St.",
          address_line_2: "Unit 1",
          city: "Chicago",
          state: "Illinois",
          zipcode: "60600",
          country: "United States",
          has_us_passport: true,
          is_authorized_us: true,
        },
        certificatesAndRatings: {
        },
        flightExperience: {
          military_sorties: 10,
          turbine: 100,
          pic_turbine: 50,
          total_flight_hours: 200,
          total_time: 240,
          total_pic_time: 120,
          total_sic_time: 80,
          multi_engine: 60,
          total_amel_asel_time: 30,
          total_instructor_time: 20,
          total_instrument_flight_time: 40,
          part_121_hours: 25,
          part_121_PIC_hours: 15,
          part_135_hours: 30,
          part_135_PIC_hours: 20,
          flown_list_regions_countries: "Europe, Asia",
          major_flight_exp: "Commercial flights",
          has_commercial_privilege: true,
          commercial_privilege_exp: "500 hours",
          has_remote_pilot_exp: false,
          has_instructor_exp: true,
          night_flight_hours: 50,
          has_part_121_or_131: false,
        },
        professionalExperience: {
          company: "Sample Airline",
          job_title: "Co-pilot",
          aircraft: "Boeing 777",
          keyrole: "Supporting role",
          date_from: new Date(),
          date_to: new Date(),
          highlight_roles_exp: "Mentored new pilots",
          job_location: "New York, NY",
        },
        education: {
          school_name: "Aviation University",
          degree: "Bachelor of Aviation",
          concentration: "Aeronautical Engineering",
          minor_concentration: "Business",
          gpa: 3.7,
          honors: "Dean's List",
          location: "Los Angeles",
          date_from: new Date(),
          date_to: new Date(),
        },
        volunteerAndLeadershipActivities: {
          has_volunteer_role: true,
          is_member_aviation_grp: true,
          volunteer_roles: [
            {
              volunteer_organization: "Volunteer Org",
              volunteer_role: "Helper",
              volunteer_responsibilities: "Assisting in events",
              volunteer_date: "2021",
              volunteer_city: "Chicago",
            },
          ],
          aviation_organizations: [
            {
              aviation_organization: "Aviation Club",
              aviation_volunteer_city: "Chicago",
              aviation_volunteer_state: "IL",
            },
          ],
        },
        leadershipAndTeamwork: {
          did_mentor_pilots: true,
          mentor_approach: "Hands-on mentoring",
          involve_in_crm: true,
          contribute_team_dynamic: "Improved team cooperation",
          manage_flight_crew: true,
          lead_strategies: "Strategic leadership",
          work_as_check_airman: false,
          checkairman_instructor_responsibilities: "",
          handle_conflict: true,
          conflict_resolution: "Effective conflict resolution techniques",
        },
        dutyDescriptionFlightOperations: {
          primary_flight_responsibilities: "Ensure safe takeoffs and landings",
          manage_flight_planning_tasks: true,
          flight_planning_tasks: "Detailed pre-flight checks",
          had_oversee_flight_inspections: true,
          oversee_flight_inspections: "Regular inspections scheduled",
          did_ensure_compliance: true,
          ensure_compliance_role: "Oversight of regulations",
          did_perform_op_duties: true,
          operational_duties: "Daily operational management",
        },
        skillsAndQualifications: {
          any_technical_soft_skills: true,
          technical_soft_skills: "Leadership, Communication",
          is_multi_bilingual: true,
          languange_1: "English",
          proficiency_level_1: "Native",
          languange_2: "Spanish",
          proficiency_level_2: "Professional",
          languange_3: "",
          proficiency_level_3: "",
        },
        emergencyAndSafetyProcedures: {
          respond_inflight_emergencies: true,
          inflight_emergencies: "Handled in-flight medical emergencies",
        },
        additionalInformation: {
          award_list: [],
          recognition_list: [],
          achievement_list: []
        },
      };
    }

    generateDocument(template, resumeData, containerRef.current, (result: GenerateDocumentResult) => {
      setGenerateDocumentResult(result);
      if (callback) {
        callback(result);
      }
    });
  };

  const downloadPdf = (template: ResumeTemplate) => {
    handleGenerateResume(template, (result) => {
      downloadFile("Resume", "pdf", result.pdf);
    });
  };

  return (
    <div className="w-full h-full pl-6 pr-6 md:pl-12 md:pr-12 py-8 md:py-12 bg-gray-50">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <PreviewCard handlePreview={handlePreview} template={ResumeTemplate.TEMPLATE_1} downloadPdf={downloadPdf} />
          <PreviewCard handlePreview={handlePreview} template={ResumeTemplate.TEMPLATE_2} downloadPdf={downloadPdf} />
          <PreviewCard handlePreview={handlePreview} template={ResumeTemplate.TEMPLATE_3} downloadPdf={downloadPdf} />
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <PreviewCard handlePreview={handlePreview} template={ResumeTemplate.TEMPLATE_4} downloadPdf={downloadPdf} />
          <PreviewCard handlePreview={handlePreview} template={ResumeTemplate.TEMPLATE_5} downloadPdf={downloadPdf} />
        </div>
      </div>
      <PreviewModal
        isOpen={openPreview}
        setIsOpen={setOpenPreview}
        dialogButtonRef={dialogButtonRef}
        generateDocumentResult={generateDocumentResult}
      />
      <div ref={containerRef} style={{ display: "none" }} />
      <div className="pt-10 flex justify-between flex-col md:flex-row">
        <Button
          type="button"
          onClick={() => navigateToStep(navigationStep - 1)}
          className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold mb-4 md:mb-0"
        >
          Previous
        </Button>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ExamplePreview), { ssr: false });

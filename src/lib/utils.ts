import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/state/api";
import {
  AdditionalFormData,
  CertificatesFormData,
  DutyDescriptionFormData,
  EducationFormData,
  EmergencyAndSafetyFormData,
  FlightExperienceFormData,
  LeadershipFormData,
  PersonalInformationFormData,
  PersonalInformationSchema,
  ProfessionalDevelopmentFormData,
  ProfessionalExperienceFormData,
  SkillsAndQualificationsFormData,
  VolunteerAndLeadershipActivities,
} from "./schemas";
import { format } from "date-fns";
import { TemplateHandler } from "easy-template-x";
import { mapResume } from "@/app/mappings/fieldMappingsDoc";
import jsPDF from "jspdf";
import PizZipUtilsInterface from "pizzip/utils/index.js";
import path from "path";
import { ResumeFields } from "@/types/api/requests";
import { renderAsync } from "docx-preview";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert cents to formatted currency string (e.g., 4999 -> "$49.99")
export function formatPrice(cents: number | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents || 0) / 100);
}

// Convert dollars to cents (e.g., "49.99" -> 4999)
export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
}

// Convert cents to dollars (e.g., 4999 -> "49.99")
export function centsToDollars(cents: number | undefined): string {
  return ((cents || 0) / 100).toString();
}

// Zod schema for price input (converts dollar input to cents)
export const priceSchema = z.string().transform((val) => {
  const dollars = parseFloat(val);
  if (isNaN(dollars)) return "0";
  return dollarsToCents(dollars).toString();
});

export const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor (Timor-Leste)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export const customStyles = "text-gray-300 placeholder:text-gray-500";

export function convertToSubCurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}

export const NAVBAR_HEIGHT = 48;

export const courseCategories = [
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
] as const;

export const customDataGridStyles = {
  border: "none",
  backgroundColor: "#17181D",
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#1B1C22",
    color: "#6e6e6e",
    "& [role='row'] > *": {
      backgroundColor: "#1B1C22 !important",
      border: "none !important",
    },
  },
  "& .MuiDataGrid-cell": {
    color: "#6e6e6e",
    border: "none !important",
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#17181D",
    "&:hover": {
      backgroundColor: "#25262F",
    },
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "#17181D",
    color: "#6e6e6e",
    border: "none !important",
  },
  "& .MuiDataGrid-filler": {
    border: "none !important",
    backgroundColor: "#17181D !important",
    borderTop: "none !important",
    "& div": {
      borderTop: "none !important",
    },
  },
  "& .MuiTablePagination-root": {
    color: "#6e6e6e",
  },
  "& .MuiTablePagination-actions .MuiIconButton-root": {
    color: "#6e6e6e",
  },
};

export const createCourseFormData = (data: CourseFormData, sections: Section[]): FormData => {
  const formData = new FormData();
  formData.append("title", data.courseTitle);
  formData.append("description", data.courseDescription);
  formData.append("category", data.courseCategory);
  formData.append("price", data.coursePrice.toString());
  formData.append("status", data.courseStatus ? "Published" : "Draft");

  const sectionsWithVideos = sections.map((section) => ({
    ...section,
    chapters: section.chapters.map((chapter) => ({
      ...chapter,
      video: chapter.video,
    })),
  }));

  formData.append("sections", JSON.stringify(sectionsWithVideos));

  return formData;
};

export const uploadAllVideos = async (localSections: Section[], courseId: string, getUploadVideoUrl: any) => {
  const updatedSections = localSections.map((section) => ({
    ...section,
    chapters: section.chapters.map((chapter) => ({
      ...chapter,
    })),
  }));

  for (let i = 0; i < updatedSections.length; i++) {
    for (let j = 0; j < updatedSections[i].chapters.length; j++) {
      const chapter = updatedSections[i].chapters[j];
      if (chapter.video instanceof File && chapter.video.type === "video/mp4") {
        try {
          const updatedChapter = await uploadVideo(chapter, courseId, updatedSections[i].sectionId, getUploadVideoUrl);
          updatedSections[i].chapters[j] = updatedChapter;
        } catch (error) {
          console.error(`Failed to upload video for chapter ${chapter.chapterId}:`, error);
        }
      }
    }
  }

  return updatedSections;
};
export function formatNumberWithCommas(num: number | undefined | null): string {
  if (num === undefined || num === null) {
    return "0";
  }
  return String(num).replace(/^\d+/, (number) =>
    [...number].map((digit, index, digits) => (!index || (digits.length - index) % 3 ? "" : ",") + digit).join("")
  );
}
export function formatDate(date: Date | string | number): string {
  if (!(date instanceof Date)) {
    date = new Date(date);
    if (!date) {
      return "";
    }
    // return "";
  }
  if (isNaN(date.getTime())) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
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

export const generateDocument = async (
  template: ResumeTemplate,
  resumeData: ResumeFields,
  callback: (result: {
    getDocx: () => Promise<Blob>;
    getPdf: () => Promise<Blob | null>;
  }) => void
) => {
  // Load the Word template
  const templatePath = path.join(process.cwd(), `/Template ${template}/SpitfireTemplate_${template}.docx`);
  const response = await fetch(templatePath);
  const templateContent = await response.arrayBuffer();
  
  if (!response.ok) {
    throw new Error("Failed to load template");
  }

  const handler = new TemplateHandler();
  const processedDoc = await handler.process(templateContent, mapResume(resumeData, template));

  const getDocx = async () => {
    return new Blob([processedDoc], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  };

  const getPdf = async () => {
    try {
      const buffer = Buffer.from(processedDoc);
      const base64String = buffer.toString("base64");

      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_CONVERT_API_URL}docx/to/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONVERT_API_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Parameters: [
            {
              Name: "File",
              FileValue: {
                Name: "resume.docx",
                Data: base64String,
              },
            },
            {
              Name: "StoreFile",
              Value: true,
            },
          ],
        }),
      });

      const apiResponseJson = await apiResponse.json();
      const pdfUrl = apiResponseJson?.Files[0]?.Url;
      return await fetch(pdfUrl).then((res) => res.blob());
    } catch (error) {
      console.error("PDF conversion failed:", error);
      return null;
    }
  };

  callback({
    getDocx,
    getPdf
  });
};

export function updateWizardStep<T>(key: string, step: number, newData: T, completed: boolean): WizardSteps<T> {
  const steps: WizardSteps<T> = JSON.parse(localStorage.getItem(key) || "[]");
  while (steps.length <= step) steps.push({ step: steps.length, data: {} as T, completed: false });
  steps[step] = { step, data: newData, completed };
  localStorage.setItem(key, JSON.stringify(steps));
  return steps;
}

async function uploadVideo(chapter: Chapter, courseId: string, sectionId: string, getUploadVideoUrl: any) {
  const file = chapter.video as File;

  try {
    const { uploadUrl, videoUrl } = await getUploadVideoUrl({
      courseId,
      sectionId,
      chapterId: chapter.chapterId,
      fileName: file.name,
      fileType: file.type,
    }).unwrap();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    toast.success(`Video uploaded successfully for chapter ${chapter.chapterId}`);

    return { ...chapter, video: videoUrl };
  } catch (error) {
    console.error(`Failed to upload video for chapter ${chapter.chapterId}:`, error);
    throw error;
  }
}

export interface ResumeData {
  personalInformation?: PersonalInformationFormData;
  certificatesAndRatings?: CertificatesFormData;
  flightExperience?: FlightExperienceFormData;
  professionalExperience?: ProfessionalExperienceFormData;
  professionalDevelopment?: ProfessionalDevelopmentFormData;
  education?: EducationFormData;
  volunteerAndLeadershipActivities?: VolunteerAndLeadershipActivities;
  leadershipAndTeamwork?: LeadershipFormData;
  dutyDescriptionFlightOperations?: DutyDescriptionFormData;
  skillsAndQualifications?: SkillsAndQualificationsFormData;
  emergencyAndSafetyProcedures?: EmergencyAndSafetyFormData;
  additionalInformation?: AdditionalFormData;
}

export const dataMapper = (steps: any): ResumeFields => {
  const slicedSteps = steps.slice(1);
  const result: ResumeFields = {
    personalInformation: {} as any,
  };
  slicedSteps.forEach((step: any) => {
    let data = step.data ?? undefined;
    switch (step.step) {
      case 1:
        result.personalInformation = data;
        break;
      case 2:
        if (data && data.certificates && data.certificates.length > 0) {
          const modifiedData = { ...data, certificates: data.certificates.map((item: any) => item.certificate) };
          data = modifiedData;
        }
        result.certificatesAndRatings = data;
        break;
      case 3:
        result.flightExperience = data;
        break;
      case 4:
        result.professionalExperience = data;
        break;
      case 5:
        if (data && data.training_list && data.training_list.length > 0) {
          const modifiedData = { ...data, training_list: data.training_list.map((item: any) => item.training) };
          data = modifiedData;
        }
        result.professionalDevelopment = data;

        break;
      case 6:
        result.education = data;
        break;
      case 7:
        result.volunteerAndLeadershipActivities = data;
        break;
      case 8:
        result.additionalInformation = data;
        break;
      default:
        break;
    }
  });
  return result;
};

export const downloadFile = (fileName: string, fileType: "pdf" | "docx", response: any) => {
  const arrayBuffer = response.data ?? response; // Handle both structures
  let blob = null;

  if (!(arrayBuffer instanceof ArrayBuffer || arrayBuffer instanceof Blob)) {
    console.error("Invalid response format", response);
    return;
  }
  if (arrayBuffer instanceof Blob) {
    blob = arrayBuffer;
  } else {
    blob = new Blob([arrayBuffer], {
      type:
        fileType === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.${fileType}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export enum ResumeTemplate {
  TEMPLATE_1 = "1",
  TEMPLATE_2 = "2",
  TEMPLATE_3 = "3",
  TEMPLATE_4 = "4",
  TEMPLATE_5 = "5",
}

export enum PrivilegeType {
  PIC = "PIC",
  SIC = "SIC",
}

export const PAGINATION_PAGE_SIZE_OPTIONS = [25, 50, 100];
export const PAGINATION_DEFAULT_PAGE_SIZE = 25;
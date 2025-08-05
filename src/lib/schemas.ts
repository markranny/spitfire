import { Certificate } from "crypto";
import { isValidPhoneNumber } from "react-phone-number-input";
import * as z from "zod";

// Course Editor Schemas
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "Title is required"),
  courseDescription: z.string().min(1, "Description is required"),
  courseCategory: z.string().min(1, "Category is required"),
  coursePrice: z.string(),
  courseStatus: z.boolean(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Chapter Schemas
export const chapterSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;

// Section Schemas
export const sectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

// Guest Checkout Schema
export const PersonalInformationSchema = z.object({
  first_name: z.string().min(1, "Please Enter a First Name").max(30, "Please enter less than 30 Characters."),
  last_name: z.string().min(1, "Please Enter a Last Name").max(30, "Please enter less than 30 Characters."),
  email: z.string().email("Invalid email address").max(30, "Please enter less than 30 Characters."),
  phone_number: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  address_line_1: z.string().min(1, "Please Enter an Address").max(30, "Please enter less than 30 Characters."),
  address_line_2: z.string(),
  city: z.string().min(1, "Please Enter a City"),
  state: z.string().min(1, "Please Select a State"),
  zipcode: z.string().min(1, "Please Enter a Zipcode"),
  country: z.string().min(1, "Country is required"),
  has_us_passport: z.boolean(),
  is_authorized_us: z.boolean(),
});

export type PersonalInformationFormData = z.infer<typeof PersonalInformationSchema>;

const ratingSchema = z.object({
  rating: z.string().optional(),
  privilege_type: z.string().optional(),
});
const certificateSchema = z.object({
  certificate: z.string().optional(),
});
export const certificatesSchema = z.object({
  airline_transport_pilot: z.string().optional(),
  flight_instructor: z.string().optional(),
  remote_pilot: z.string().optional(),
  medical: z.string().optional(),
  certificates: z.array(certificateSchema).optional(),
  pic_sic_ratings: z.array(ratingSchema).optional(),
});

// privilege_type "PIC" | "SIC"

export type CertificatesFormData = z.infer<typeof certificatesSchema>;

const OperatedAirCraftSchema = z.object({
  aircraft: z.string().optional(),
  flight_hours: z.number().optional(),
  privilege_type: z.string().optional(),
});
export const FlightExperienceSchema = z.object({
  military_sorties: z.number().optional(),
  turbine: z.number().optional(),
  pic_turbine: z.number().optional(),
  total_flight_hours: z.number().optional(),
  total_time: z.number().optional(),
  total_pic_time: z.number().optional(),
  total_sic_time: z.number().optional(),
  multi_engine: z.number().optional(),
  total_amel_asel_time: z.number().optional(),
  total_instructor_time: z.number().optional(),
  total_instrument_flight_time: z.number().optional(),
  has_part_121_or_131: z.boolean(),
  part_121_hours: z.number().optional(),
  part_121_PIC_hours: z.number().optional(),
  part_135_hours: z.number().optional(),
  part_135_PIC_hours: z.number().optional(),
  flown_list_regions_countries: z.string().optional(),
  has_major_flight_exp: z.boolean(),
  major_flight_exp: z.string().optional(),
  has_commercial_privilege: z.boolean(),
  commercial_privilege_exp: z.string().optional(),
  has_remote_pilot_exp: z.boolean(),
  has_instructor_exp: z.boolean(),
  night_flight_hours: z.number().optional(),
  aircraft_operated_list: z.array(OperatedAirCraftSchema).optional(),
});
export type FlightExperienceFormData = z.infer<typeof FlightExperienceSchema>;

export const ProfessionalExperienceSchema = z.object({
  company: z.string().optional(),
  job_title: z.string().optional(),
  aircraft: z.string().optional(),
  job_location: z.string().optional(),
  date_from: z.date().nullable(),
  date_to: z.date().nullable(),
  keyrole: z.string().optional(),
  keyrole_original: z.string().optional(),
  keyrole_generated: z.string().optional(),
  highlight_roles_exp: z.string().optional(),
  currently_employed: z.boolean().optional(),
});

export type ProfessionalExperienceFormData = z.infer<typeof ProfessionalExperienceSchema>;

export const ProfessionalDevelopmentSchema = z.object({
  has_completed_training: z.boolean(),
  training_list: z
    .array(
      z.object({
        training: z.string().optional(),
      })
    )
    .optional(),
});

export type ProfessionalDevelopmentFormData = z.infer<typeof ProfessionalDevelopmentSchema>;

export const EducationSchema = z.object({
  school_name: z.string().optional(),
  degree: z.string().optional(),
  concentration: z.string().optional(),
  minor_concentration: z.string().optional(),
  gpa: z.number().optional(),
  honors: z.string().optional(),
  location: z.string().optional(),
  date_from: z.date().nullable(),
  date_to: z.date().nullable(),
});

export type EducationFormData = z.infer<typeof EducationSchema>;

export const VolunteerRoleSchema = z.object({
  volunteer_city: z.string().optional(),
});

export const AviationOrganizationSchema = z.object({
  aviation_organization: z.string().optional(),
  aviation_volunteer_city: z.string().optional(),
  aviation_volunteer_state: z.string().optional(),
});

const VolunteerSchema = z.object({
  organization: z.string().optional(),
  volunteer_type: z.string().optional(),
  role: z.string().optional(),
  role_original: z.string().optional(),
  role_generated: z.string().optional(),
  volunteer_responsibilities: z.string().optional(),
  date_from: z.date().nullable(),
  date_to: z.date().nullable(),
  responsibilities: z.string().optional(),
  responsibilities_original: z.string().optional(),
  responsibilities_generated: z.string().optional(),
  currently_volunteering: z.boolean(),
});
export const VolunteeringSchema = z.object({
  has_volunteer_role: z.boolean(),
  volunteer_list: z.array(VolunteerSchema).optional(),
});

export type VolunteeringFormData = z.infer<typeof VolunteeringSchema>;
export interface VolunteerRole {
  volunteer_organization?: string;
  volunteer_role?: string;
  volunteer_responsibilities?: string;
  volunteer_date?: string;
  volunteer_city?: string;
}

export interface VolunteerAndLeadershipActivities {
  has_volunteer_role: boolean;
  is_member_aviation_grp: boolean;
  volunteer_roles?: VolunteerRole[];
  aviation_organizations?: AviationOrganization[];
}

export interface AviationOrganization {
  aviation_organization?: string;
  aviation_volunteer_city?: string;
  aviation_volunteer_state?: string;
}

export const LeadershipSchema = z.object({
  did_mentor_pilots: z.boolean(),
  mentor_approach: z.string().optional(),
  involve_in_crm: z.boolean(),
  contribute_team_dynamic: z.string().optional(),
  manage_flight_crew: z.boolean(),
  lead_strategies: z.string().optional(),
  work_as_check_airman: z.boolean(),
  checkairman_instructor_responsibilities: z.string().optional(),
  handle_conflict: z.boolean(),
  conflict_resolution: z.string().optional(),
});

export type LeadershipFormData = z.infer<typeof LeadershipSchema>;

export const DutyDescriptionSchema = z.object({
  primary_flight_responsibilities: z.string().optional(),
  manage_flight_planning_tasks: z.boolean(),
  flight_planning_tasks: z.string().optional(),
  had_oversee_flight_inspections: z.boolean(),
  oversee_flight_inspections: z.string().optional(),
  did_ensure_compliance: z.boolean(),
  ensure_compliance_role: z.string().optional(),
  did_perform_op_duties: z.boolean(),
  operational_duties: z.string().optional(),
});

export type DutyDescriptionFormData = z.infer<typeof DutyDescriptionSchema>;

export const SkillsAndQualificationsSchema = z.object({
  any_technical_soft_skills: z.boolean(),
  technical_soft_skills: z.string().optional(),
  is_multi_bilingual: z.boolean(),
  languange_1: z.string().optional(),
  proficiency_level_1: z.string().optional(),
  languange_2: z.string().optional(),
  proficiency_level_2: z.string().optional(),
  languange_3: z.string().optional(),
  proficiency_level_3: z.string().optional(),
});

export type SkillsAndQualificationsFormData = z.infer<typeof SkillsAndQualificationsSchema>;

export const EmergencyAndSafetySchema = z.object({
  respond_inflight_emergencies: z.boolean(),
  inflight_emergencies: z.string().optional(),
});

export type EmergencyAndSafetyFormData = z.infer<typeof EmergencyAndSafetySchema>;

export const ContactInformationSchema = z.object({
  name: z.string().min(1, "Please Enter a Name"),
  email: z.string().email("Invalid email address"),
  airlinePreference: z.string().min(1, "Please Enter an Airline Name"),
  position: z.string().min(1, "Please Select a Position"),
  otherPosition: z.string().optional(),
  selectedTemplates: z.array(z.string()).min(1, "Please select at least one template"),
});
export type ContactInformationFormData = z.infer<typeof ContactInformationSchema>;

export const AdditionalSchema = z.object({
  award_recognition_list: z.array(
    z.object({
      award_recognition: z.string().optional(),
      date: z.date().nullable(),
    })
  ),
  achievement_list: z.array(
    z.object({
      achievement: z.string().optional(),
    })
  ),
});

export type AdditionalFormData = z.infer<typeof AdditionalSchema>;
// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const SubmissionFiltersSchema = z.object({
  state: z.string().optional(),
  date: z.date().nullable().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});
export type SubmissionFiltersFormData = z.infer<typeof SubmissionFiltersSchema>;

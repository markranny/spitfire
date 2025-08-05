export interface PersonalInformation {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  phone_number: string;
  email: string;
  has_us_passport: boolean;
  authorized_work_in_US: boolean;
}

export interface CertificatesAndRatings {
  certificates?: string[] | null;
  pic_sic_ratings?: PICAndSICRatings[];
  airline_transport_pilot?: string;
  flight_instructor?: string;
  remote_pilot?: string;
  medical?: string;
}

export interface PICAndSICRatings {
  rating?: string;
  privilege_type?: PrivilegeType; // 0 - PIC, 1 - SIC
}


export interface FlightExperience {
    military_sorties?: number;
    turbine?: number;
    pic_turbine?: number;
    total_flight_hours?: number;
    total_time?: number;
    total_pic_time?: number;
    total_sic_time?: number;
    multi_engine?: number;
    total_amel_asel_time?: number;
    total_instructor_time?: number;
    total_instrument_flight_time?: number;
    part_121_hours?: number;
    part_121_PIC_hours?: number;
    part_135_hours?: number;
    part_135_PIC_hours?: number;
    major_flight_exp?: string;    
    night_flight_hours?: number;
    has_commercial_privilege: boolean;
    commercial_privilege_exp?: string;
    aircraft_operated_list?: AircraftOperated[];
}

export interface AircraftOperated {
  aircraft?: string;
  flight_hours?: number;
  privilege_type?: PrivilegeType;
}

export interface ProfessionalExperience {
  job_title: string;
  company?: string; // company / squadron
  aircraft?: string;
  date_from?: Date;
  date_to?: Date;
  keyrole?: string; // key responsibilities and accomplishments
  keyrole_original?: string; // original key role description before LLM generation
  keyrole_generated?: string; // generated key role description by LLM
  currently_employed?: boolean;
  highlight_roles_exp?: string;
  job_location?: string;
}

export interface ProfessionalDevelopment {
  has_completed_training: boolean;
  training_list? : string[];
}

export interface Education {
  school_name: string;
  degree: string;
  concentration?: string;
  minor_concentration?: string;
  gpa?: number;
  honors?: string;
  date_from?: Date;
  date_to?: Date;
  location?: string;
}

export interface Training {
  name: string
}

export interface VolunteerAndLeadershipActivities {
  has_volunteer_role: boolean;
  volunteer_list?: Volunteer[];
}

export interface Volunteer {
  organization?: string;
  role?: string;
  is_aviation: boolean;
  date_from?: Date,
  date_to?: Date,
  currently_volunteering?: boolean,
  responsibilities?: string;
}

export interface AdditionalInformation {
  award_recognition_list?: Award[];
  achievement_list?: Achievements[];
}

export interface ContactInfomration {
  name?: string;
  email?: string;
  airline_preference?: string;
  selected_templates?: string[];
}

export interface Award_Recognition {
  award_recognition?: string;
  date?: Date | null;
}

export interface Recognition {
  recognition?: string;
  recognition_date?: Date | null;
}

export interface Achievements {
  achievement?: string;
}

export interface ResumeFields {
  personalInformation: PersonalInformation;
  certificatesAndRatings?: CertificatesAndRatings | null;
  flightExperience?: FlightExperience | null;
  professionalExperience?: ProfessionalExperience[] | null;
  professionalDevelopment?: ProfessionalDevelopment | null;
  education?: Education[] | null; 
  volunteerAndLeadershipActivities?: VolunteerAndLeadershipActivities | null;
  additionalInformation?: AdditionalInformation | null;
}

export interface UpdateSubmission {
  submission: {
    state: string;
    name?: string;
    email?: string;
    airlinePreference?: string;
    position?: string;
    selectedTemplates?: string[];
  }
}

export interface CreateSubmission {
  submission: {
    resumeId: string;
    name: string;
    email: string;
    airline_preference: string;
    position?: string;
    selected_templates: string[];
  }
}

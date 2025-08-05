import { CertificatesAndRatings, ResumeFields } from "@/types/api/requests";
import { TemplateData } from "easy-template-x";
import { formatDate, formatNumberWithCommas, PrivilegeType, ResumeTemplate} from "../../lib/utils";
import { nullable } from "zod";
// import { formatPhoneNumber, formatPhoneNumberIntl } from 'react-phone-number-input'

export function mapResumeDataToTemplate(resumeData: ResumeFields): TemplateData {
    return {
        full_name: `${resumeData.personalInformation.first_name} ${resumeData.personalInformation.last_name}`,
        address: `${resumeData.personalInformation.address_line_1} ${resumeData.personalInformation.address_line_2 || ''}`.trim(),
        country: resumeData.personalInformation.country,
        city: resumeData.personalInformation.city,
        state: resumeData.personalInformation.state,
        zipcode: resumeData.personalInformation.zipcode,
        phone: resumeData.personalInformation.phone_number,
        email: resumeData.personalInformation.email,
        authorized_work: resumeData.personalInformation.authorized_work_in_US,
        has_us_passport: resumeData.personalInformation.has_us_passport ? true : false,
        has_certificates: resumeData.certificatesAndRatings && 
            resumeData.certificatesAndRatings?.certificates && 
            resumeData.certificatesAndRatings.certificates.length > 0 ? true : false,
        certificates: resumeData.certificatesAndRatings?.certificates?.map(cert => ({
            certificate: cert || '',
        })) || [],
        certificates_string: resumeData.certificatesAndRatings?.certificates?.join(', ').trim() || '',

        has_picsic_ratings: resumeData.certificatesAndRatings && 
            resumeData.certificatesAndRatings?.pic_sic_ratings && 
            resumeData.certificatesAndRatings.pic_sic_ratings.length > 0 ? true : false,
        ratings: resumeData.certificatesAndRatings?.pic_sic_ratings?.map(rating => ({
            rating: rating.rating || '',
            privilege: rating.privilege_type?.toString() || '',
        })) || [],

        has_flight_experience: resumeData.flightExperience ? true : false,
        total_flight_hours: formatNumberWithCommas(resumeData.flightExperience?.total_flight_hours),
        night_flight_hours: formatNumberWithCommas(resumeData.flightExperience?.night_flight_hours),
        pic: formatNumberWithCommas(resumeData.flightExperience?.total_pic_time),
        sic: formatNumberWithCommas(resumeData.flightExperience?.total_sic_time),
        pic_turbine: formatNumberWithCommas(resumeData.flightExperience?.pic_turbine),
        turbine: formatNumberWithCommas(resumeData.flightExperience?.turbine),
        multi_engine: formatNumberWithCommas(resumeData.flightExperience?.multi_engine),
        total_instructor_time: formatNumberWithCommas(resumeData.flightExperience?.total_instructor_time),
        total_instrument_flight_time: formatNumberWithCommas(resumeData.flightExperience?.total_instrument_flight_time),
        total_amel_asel_time: formatNumberWithCommas(resumeData.flightExperience?.total_amel_asel_time),
        military_sorties: formatNumberWithCommas(resumeData.flightExperience?.military_sorties),
        part_121_hours: formatNumberWithCommas(resumeData.flightExperience?.part_121_hours),
        part_121_PIC_hours: formatNumberWithCommas(resumeData.flightExperience?.part_121_PIC_hours),
        part_135_hours: formatNumberWithCommas(resumeData.flightExperience?.part_135_hours),
        part_135_PIC_hours: formatNumberWithCommas(resumeData.flightExperience?.part_135_PIC_hours),
        has_commercial_priv: resumeData.flightExperience?.has_commercial_privilege ? true : false,
        commercial_privilege_exp: resumeData.flightExperience?.commercial_privilege_exp || 'N/A',
        major_flight_exp: resumeData.flightExperience?.major_flight_exp || 'N/A',

        has_aircraft_operated: resumeData.flightExperience && 
            resumeData.flightExperience.aircraft_operated_list && 
            resumeData.flightExperience.aircraft_operated_list.length ? true : false,
        aircrafts: resumeData.flightExperience?.aircraft_operated_list?.map(aircraft => ({
            aircraft: aircraft.aircraft || '',
            flight_hrs: aircraft.flight_hours || 0,
            aircraft_type: aircraft.privilege_type?.toString() || '',
        })) || [],

        has_professional_experience: resumeData.professionalExperience && resumeData.professionalExperience?.length ? true : false,
        professional_experience: resumeData.professionalExperience?.map(exp => ({
            job_title: exp.job_title || '',
            company: exp.company || '',
            location: exp.job_location || '',
            employment_dates: `${
                exp.date_from ? formatDate(exp.date_from) : ''
              } - ${
                exp.currently_employed 
                  ? 'Present' 
                  : exp.date_to 
                    ? formatDate(exp.date_to) 
                    : ''
              }`,
            key_role: exp.keyrole || '',
            highlights: exp.highlight_roles_exp || '',
        })) || [],

        has_education: resumeData.education && resumeData.education?.length > 0 ? true : false,
        education: resumeData.education?.map(edu => ({
            school_name: edu.school_name || '',
            degree: edu.degree || '',
            concentration: edu.concentration || '',
            minor_con: edu.minor_concentration || '',
            college_period: `${edu.date_from ? formatDate(edu.date_from) : '' } - ${edu.date_to ? formatDate(edu.date_to) : '' }`,
            college_location: edu.location || '',
            gpa: edu.gpa || '',
            honors: edu.honors || '',
        })) || [],

        has_volunteer: resumeData.volunteerAndLeadershipActivities && resumeData.volunteerAndLeadershipActivities?.has_volunteer_role ? true : false,
        volunteer: resumeData.volunteerAndLeadershipActivities?.volunteer_list?.map((volunteer, index) => ({
            organization: volunteer.organization || '',
            role: volunteer.role || '',
            responsibilities: volunteer.responsibilities || '',
            date: `${
                volunteer.date_from ? formatDate(volunteer.date_from) : ''
              } - ${
                volunteer.currently_volunteering 
                  ? 'Present' 
                  : volunteer.date_to 
                    ? formatDate(volunteer.date_to) 
                    : ''
              }`,
            last: index !== resumeData.volunteerAndLeadershipActivities!.volunteer_list!.length - 1,
            volunteer_type: volunteer.is_aviation ? 'Aviation' : 'Non-Aviation' 
        })) || [],

        has_award: resumeData.additionalInformation && resumeData.additionalInformation.award_recognition_list ? true : false,
        award_info: resumeData.additionalInformation?.award_recognition_list?.map((award, index) => ({
            award_recognition: award.award_recognition || '',
            date: award.date ? formatDate(award.date) : '',
            last: index !== resumeData.additionalInformation!.award_recognition_list!.length - 1,

        })) || [],

        has_achievement: resumeData.additionalInformation && resumeData.additionalInformation.achievement_list ? true : false,
        achievement: resumeData.additionalInformation?.achievement_list?.map((achievement, index) => ({
            achievement: achievement.achievement || '',
            last: index !== resumeData.additionalInformation!.achievement_list!.length - 1,
        })) || [],

    };
}


export function mapResume(resumeData: ResumeFields, template: ResumeTemplate): any {
    const sortedProfessionalExperience = resumeData.professionalExperience
    ? [...resumeData.professionalExperience].sort((a, b) => {
        // Handle "Present" cases first
        if (a.currently_employed && !b.currently_employed) return -1; // a comes first
        if (!a.currently_employed && b.currently_employed) return 1;  // b comes first

        // Both are "Present" - sort by date_from (latest first)
        if (a.currently_employed && b.currently_employed) {
            const dateA = a.date_from ? new Date(a.date_from).getTime() : 0; // Convert to timestamp, default to 0 if missing
            const dateB = b.date_from ? new Date(b.date_from).getTime() : 0;
            return dateB - dateA; // Descending order
        }

        // Neither is "Present" - sort by date_to (latest first)
        const dateA = a.date_to ? new Date(a.date_to).getTime() : 0; // Convert to timestamp, default to 0 if missing
        const dateB = b.date_to ? new Date(b.date_to).getTime() : 0;
        return dateB - dateA; // Descending order
    })
    : [];
    const sortedEducation = resumeData.education
    ? [...resumeData.education].sort((a, b) => {
        const dateA = a.date_to ? new Date(a.date_to).getTime() : 0;
        const dateB = b.date_to ? new Date(b.date_to).getTime() : 0;
        return dateB - dateA; // Sort by date_to, latest first
    })
    : [];
    const sortedVolunteer = resumeData.volunteerAndLeadershipActivities?.volunteer_list
    ? [...resumeData.volunteerAndLeadershipActivities.volunteer_list].sort((a, b) => {
        // Handle "Present" cases first
        if (a.currently_volunteering && !b.currently_volunteering) return -1;
        if (!a.currently_volunteering && b.currently_volunteering) return 1;

        // Both are "Present" - sort by date_from (latest first)
        if (a.currently_volunteering && b.currently_volunteering) {
            const dateA = a.date_from ? new Date(a.date_from).getTime() : 0;
            const dateB = b.date_from ? new Date(b.date_from).getTime() : 0;
            return dateB - dateA; // Descending order
        }

        // Neither is "Present" - sort by date_to (latest first)
        const dateA = a.date_to ? new Date(a.date_to).getTime() : 0;
        const dateB = b.date_to ? new Date(b.date_to).getTime() : 0;
        return dateB - dateA; // Descending order
    })
    : [];
    // if (!resumeData?.personalInformation?.phone_number) {
    // console.log(formatPhoneNumber);
    // }
    let mappedData =  {
        full_name: `${resumeData.personalInformation.first_name} ${resumeData.personalInformation.last_name}`,
        address: `${resumeData.personalInformation.address_line_1} ${resumeData.personalInformation.address_line_2 || ''}`.trim(),
        address_1: resumeData.personalInformation.address_line_1 || "",
        address_2: resumeData.personalInformation.address_line_2 || "",
        country: resumeData.personalInformation.country,
        city: resumeData.personalInformation.city,
        state: resumeData.personalInformation.state,
        zipcode: resumeData.personalInformation.zipcode,
        phone: resumeData?.personalInformation?.phone_number || "",
        email: resumeData.personalInformation.email,
        authorized_work: resumeData.personalInformation.authorized_work_in_US,
        has_us_passport: resumeData.personalInformation.has_us_passport ? true : false,
        airline_transport_pilot: resumeData.certificatesAndRatings?.airline_transport_pilot || '',
        has_atp: resumeData.certificatesAndRatings?.airline_transport_pilot ? true : false,
        flight_instructor: resumeData.certificatesAndRatings?.flight_instructor || '',
        has_fi: resumeData.certificatesAndRatings?.flight_instructor ? true : false,
        remote_pilot: resumeData.certificatesAndRatings?.remote_pilot || '',
        has_rp: resumeData.certificatesAndRatings?.remote_pilot ? true : false,
        medical: resumeData.certificatesAndRatings?.medical || '',
        has_medical: resumeData.certificatesAndRatings?.medical ? true : false,
        has_certificates: resumeData.certificatesAndRatings && 
            resumeData.certificatesAndRatings?.certificates && 
            resumeData.certificatesAndRatings.certificates.length > 0 ? true : false,
        certificates: resumeData.certificatesAndRatings?.certificates?.map(cert => ({
            certificate: cert.trim() || '',
        })) || [],

        certificates_string: resumeData.certificatesAndRatings?.certificates?.join(', ') || '',

        has_picsic_ratings: resumeData.certificatesAndRatings && 
            resumeData.certificatesAndRatings?.pic_sic_ratings && 
            resumeData.certificatesAndRatings.pic_sic_ratings.length > 0 ? true : false,
        ratings: resumeData.certificatesAndRatings?.pic_sic_ratings?.map(rating => ({
            rating: rating.rating && rating.rating?.trim() || '',
            privilege: rating.privilege_type?.toString() || '',
        })) || [],

        ratings_string: resumeData.certificatesAndRatings?.pic_sic_ratings
                        ?.map(rating => rating.rating || '')
                        .filter(r => r) // Remove empty values
                        .join(', ') || '',

        has_cert_rating: resumeData.certificatesAndRatings && 
        (resumeData.certificatesAndRatings?.pic_sic_ratings && 
        resumeData.certificatesAndRatings.pic_sic_ratings.length > 0) || 
        (resumeData.certificatesAndRatings?.certificates && 
        resumeData.certificatesAndRatings.certificates.length > 0),
        has_ratings: resumeData.certificatesAndRatings && 
            resumeData.certificatesAndRatings?.pic_sic_ratings && 
            resumeData.certificatesAndRatings.pic_sic_ratings.length > 0 ? true : false,

        

        has_flight_experience: resumeData.flightExperience ? true : false,
        total_flight_hours: formatNumberWithCommas(resumeData.flightExperience?.total_flight_hours),
        night_flight_hours: formatNumberWithCommas(resumeData.flightExperience?.night_flight_hours),
        pic: formatNumberWithCommas(resumeData.flightExperience?.total_pic_time),
        sic: formatNumberWithCommas(resumeData.flightExperience?.total_sic_time),
        pic_turbine: formatNumberWithCommas(resumeData.flightExperience?.pic_turbine),
        turbine: formatNumberWithCommas(resumeData.flightExperience?.turbine),
        multi_engine: formatNumberWithCommas(resumeData.flightExperience?.multi_engine),
        total_instructor_time: formatNumberWithCommas(resumeData.flightExperience?.total_instructor_time),
        total_instrument_flight_time: formatNumberWithCommas(resumeData.flightExperience?.total_instrument_flight_time),
        total_amel_asel_time: formatNumberWithCommas(resumeData.flightExperience?.total_amel_asel_time),
        military_sorties: formatNumberWithCommas(resumeData.flightExperience?.military_sorties),
        part_121_hours: formatNumberWithCommas(resumeData.flightExperience?.part_121_hours),
        part_121_PIC_hours: formatNumberWithCommas(resumeData.flightExperience?.part_121_PIC_hours),
        part_135_hours: formatNumberWithCommas(resumeData.flightExperience?.part_135_hours),
        part_135_PIC_hours: formatNumberWithCommas(resumeData.flightExperience?.part_135_PIC_hours),
        has_commercial_priv: resumeData.flightExperience?.has_commercial_privilege ? true : false,
        commercial_privilege_exp: resumeData.flightExperience?.commercial_privilege_exp || 'N/A',
        major_flight_exp: resumeData.flightExperience?.major_flight_exp || 'N/A',

        has_aircraft_operated: resumeData.flightExperience && 
            resumeData.flightExperience.aircraft_operated_list && 
            resumeData.flightExperience.aircraft_operated_list.length ? true : false,
        aircrafts: resumeData.flightExperience?.aircraft_operated_list?.map(aircraft => ({
            aircraft: aircraft.aircraft || '',
            flight_hrs: aircraft.flight_hours || 0,
            aircraft_type: aircraft.privilege_type?.toString() || '',
        })) || [],

        // STATIC AIRCRAFT TEMPLATE 1
        aircraft1: resumeData.flightExperience?.aircraft_operated_list?.[0]?.aircraft || '',
        aircraft2: resumeData.flightExperience?.aircraft_operated_list?.[1]?.aircraft || '',
        aircraft3: resumeData.flightExperience?.aircraft_operated_list?.[2]?.aircraft || '',
        aircraft4: resumeData.flightExperience?.aircraft_operated_list?.[3]?.aircraft || '',

        has_1 : Boolean(resumeData.flightExperience?.aircraft_operated_list?.[0]?.aircraft),
        has_2 : Boolean(resumeData.flightExperience?.aircraft_operated_list?.[1]?.aircraft),
        has_3 : Boolean(resumeData.flightExperience?.aircraft_operated_list?.[2]?.aircraft),
        has_4 : Boolean(resumeData.flightExperience?.aircraft_operated_list?.[3]?.aircraft),
        a_1_hrs: resumeData.flightExperience?.aircraft_operated_list?.[0]?.flight_hours || 0,
        a_2_hrs: resumeData.flightExperience?.aircraft_operated_list?.[1]?.flight_hours || 0,
        a_3_hrs: resumeData.flightExperience?.aircraft_operated_list?.[2]?.flight_hours || 0,
        a_4_hrs: resumeData.flightExperience?.aircraft_operated_list?.[3]?.flight_hours || 0,
        
        aircraft_1_type: resumeData.flightExperience?.aircraft_operated_list?.[0]?.privilege_type?.toString() || '',
        aircraft_2_type: resumeData.flightExperience?.aircraft_operated_list?.[1]?.privilege_type?.toString() || '',
        aircraft_3_type: resumeData.flightExperience?.aircraft_operated_list?.[2]?.privilege_type?.toString() || '',
        aircraft_4_type: resumeData.flightExperience?.aircraft_operated_list?.[3]?.privilege_type?.toString() || '',

        has_professional_experience: resumeData.professionalExperience && resumeData.professionalExperience?.length ? true : false,
        // professional_experience: resumeData.professionalExperience?.map(exp => ({
        //     job_title: exp.job_title || '',
        //     company: exp.company || '',
        //     location: exp.job_location || '',
        //           employment_dates: `${exp.date_from ? formatDate(exp.date_from) : '' } - ${exp.currently_employed ? 'Present' : exp.date_to ? formatDate(exp.date_to) : '' }`
        //     key_role: exp.keyrole || '',
        //     highlights: exp.highlight_roles_exp || '',
        // })) || [],

        professional_experience: sortedProfessionalExperience?.map(exp => ({
            job_title: exp.job_title || '',
            company: exp.company || '',
            location: exp.job_location || '',
            employment_dates: `${exp.date_from ? formatDate(exp.date_from) : '' } - ${exp.currently_employed ? 'Present' : exp.date_to ? formatDate(exp.date_to) : '' }`,
            key_role: exp.keyrole,
            highlights: exp.highlight_roles_exp,
            aircraft: exp.aircraft || '',
            key_roles_arr: exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            highlight_roles_arr: exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `${highlight.trim()}` })) : [],
             // Merge key roles and highlights into one formatted block
             key_role_highlights: [
                ...(exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : []),
                ...(exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `${highlight.trim()}` })) : [])
            ]
        })) || [],
        

        has_education: resumeData.education && resumeData.education?.length > 0 ? true : false,
        education: sortedEducation.map(edu => ({
            school_name: edu.school_name || '',
            degree: edu.degree || '',
            concentration: edu.concentration || '',
            minor_con: edu.minor_concentration || '',
            college_period: `${edu.date_from ? formatDate(edu.date_from) : '' } - ${edu.date_to ? formatDate(edu.date_to) : '' }`,
            college_location: edu.location || '',
            gpa: edu.gpa || '',
            honors: edu.honors || '',
            has_honors: edu.honors && edu.honors.length > 0 ? true : false
        })) || [],

        has_prof_training: resumeData.professionalDevelopment && resumeData.professionalDevelopment.has_completed_training && 
                           resumeData.professionalDevelopment.training_list && resumeData.professionalDevelopment.training_list?.length > 0 ? true : false,
        training: resumeData.professionalDevelopment?.training_list
            ?.map((training) => training || '')
            .filter(r => r.trim())
            .join(', ') || '',
        trainings : resumeData.professionalDevelopment?.training_list?.map((val)=>{return {training: val}}) || [],    
        has_volunteer: resumeData.volunteerAndLeadershipActivities && resumeData.volunteerAndLeadershipActivities?.has_volunteer_role &&
        resumeData.volunteerAndLeadershipActivities.volunteer_list && resumeData.volunteerAndLeadershipActivities.volunteer_list.length > 0 ? true : false,
        volunteer: sortedVolunteer?.map((volunteer, index) => ({
            organization: volunteer.organization || '',
            // Format role with bullets
            role: volunteer.role ? `\t• ${volunteer.role.replace(/\n/g, '\n\t• ')}` : '',
            roleArray: volunteer.role ? volunteer.role.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            // Format responsibilities with bullets
            responsibilities: volunteer.responsibilities ? `\t• ${volunteer.responsibilities.replace(/\n/g, '\n\t• ')}` : '',
            responsibilitiesArray: volunteer.responsibilities ? volunteer.responsibilities.split('\n').filter(responsibility => responsibility.trim()).map(responsibility => ({ bullet: `${responsibility.trim()}` })) : [],
            date: `${volunteer.date_from ? formatDate(volunteer.date_from) : '' } - ${volunteer.currently_volunteering ? 'Present' : volunteer.date_to ? formatDate(volunteer.date_to) : '' }`,
            last: index !== resumeData.volunteerAndLeadershipActivities!.volunteer_list!.length - 1,
            volunteer_type: volunteer.is_aviation ? 'Aviation' : 'Non-Aviation'
        })) || [],

        volunteer_roles: '', // Template 2 - Role

        has_attainments: false,
        has_award_recognition: resumeData.additionalInformation && resumeData.additionalInformation.award_recognition_list ? true : false,
        award_info: resumeData.additionalInformation?.award_recognition_list?.map((award, index) => ({
            award_recognition: award.award_recognition || '',
            date: award.date ? formatDate(award.date) : '',
            last: index !== resumeData.additionalInformation!.award_recognition_list!.length - 1,

        })) || [],


        has_achievement: resumeData.additionalInformation && resumeData.additionalInformation.achievement_list ? true : false,
        achievements: resumeData.additionalInformation?.achievement_list?.map((achievement, index) => ({
            achievement: achievement.achievement || '',
            last: index !== resumeData.additionalInformation!.achievement_list!.length - 1,
        })) || [],

    };

    // Handle different template formats
    if (template === ResumeTemplate.TEMPLATE_1) {
        mappedData.certificates_string = (resumeData.certificatesAndRatings?.certificates?.join(', ') || '') 
        mappedData.ratings_string = resumeData.certificatesAndRatings?.pic_sic_ratings
            ?.map(rating => rating.rating || '')
            .filter(r => r)
            .join(', ') || '';
        mappedData.ratings_string = mappedData.ratings_string 
        // Ensure dashes appear only when values exist
        // if (mappedData.certificates_string) {
        //     mappedData.certificates_string = `- ${mappedData.certificates_string}`;
        // }
        // if (mappedData.ratings_string) {
        //     mappedData.ratings_string = `- ${mappedData.ratings_string}`;
        // }
        mappedData.aircraft1 = `${mappedData.aircraft1}${mappedData.aircraft_1_type ? `-(${mappedData.aircraft_1_type})` : ''}`
        mappedData.aircraft2 = `${mappedData.aircraft2}${mappedData.aircraft_2_type ? `-(${mappedData.aircraft_2_type})` : ''}`
        mappedData.aircraft3 = `${mappedData.aircraft3}${mappedData.aircraft_3_type ? `-(${mappedData.aircraft_3_type})` : ''}`
        mappedData.aircraft4 = `${mappedData.aircraft4}${mappedData.aircraft_4_type ? `-(${mappedData.aircraft_4_type})` : ''}`

        mappedData.has_cert_rating = !!(mappedData.certificates_string || mappedData.ratings_string);
    } else if (template === ResumeTemplate.TEMPLATE_2) {
        // Format certificates as a comma-separated string
        const certificates = resumeData.certificatesAndRatings?.certificates
        ?.filter(cert => cert.trim()) // Remove empty values
        .join(', ') || '';

        // Format ratings: First one should have "Type Ratings: ", others should be comma-separated
        const ratingsList = resumeData.certificatesAndRatings?.pic_sic_ratings
        ?.map(rating => rating.rating?.trim())
        .filter(r => r); // Remove empty values

        const typeRatings = ratingsList && ratingsList.length ? `Type Ratings: ${ratingsList.join(', ')}` : '';

        // Combine certificates and ratings with " | " only if both exist
        mappedData.certificates_string = certificates && typeRatings 
        ? `${certificates} | ${typeRatings}` 
        : certificates || typeRatings; // Show whichever exists

        // Activities
        const rolesList = resumeData.volunteerAndLeadershipActivities?.volunteer_list
        ?.map(volunteer => volunteer.role?.trim()) // Get only role values
        .filter(role => role); // Remove empty values

        // Join roles with " | " separator
        mappedData.volunteer_roles = rolesList && rolesList.length ? rolesList.join(' | ') : '';

    } else if (template === ResumeTemplate.TEMPLATE_3) {
          // Format certificates as a comma-separated string
          const certificates = resumeData.certificatesAndRatings?.certificates
          ?.filter(cert => cert.trim()) // Remove empty values
          .join(', ') || '';
  
          // Format ratings: First one should have "Type Ratings: ", others should be comma-separated
          const ratingsList = resumeData.certificatesAndRatings?.pic_sic_ratings
          ?.map(rating => rating.rating?.trim())
          .filter(r => r); // Remove empty values
          const typeRatings = ratingsList && ratingsList.length ? `${ratingsList.join(', ')}` : '';
  
          // Combine certificates and ratings with " | " only if both exist
          mappedData.certificates_string = certificates;
          mappedData.ratings_string = typeRatings;

          // Keyrole & Highlights
          mappedData.professional_experience = resumeData.professionalExperience?.map(exp => ({
            job_title: exp.job_title || '',
            company: exp.company || '',
            location: exp.job_location || '',
            employment_dates: `${exp.date_from ? formatDate(exp.date_from) : '' } - ${exp.currently_employed ? 'Present' : exp.date_to ? formatDate(exp.date_to) : '' }`,
            key_role: exp.keyrole,
            highlights: exp.highlight_roles_exp,
            aircraft: exp.aircraft || '',
            key_roles_arr: exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            highlight_roles_arr: exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `${highlight.trim()}` })) : [],
           
        
            // Merge key roles and highlights into one formatted block
            key_role_highlights: exp.keyrole || exp.highlight_roles_exp 
                ? [
                    ...exp.keyrole?.split('\n').filter(role => role.trim()).map((role, index) => {
                        const highlight = exp.highlight_roles_exp?.split('\n')[index]?.trim() || '';
                        return { bullet: role.trim() };
                    }) || [],
                    // If there are extra highlights without corresponding key roles, add them separately
                    ...exp.highlight_roles_exp?.split('\n').filter(highlight => highlight.trim()).map(highlight => ({
                        bullet: highlight.trim()
                    })) || []
                ]
                : []
          })) || [];

          // Volunteer
          mappedData.volunteer = resumeData.volunteerAndLeadershipActivities?.volunteer_list?.map((volunteer, index) => ({
            organization: volunteer.organization || '',
            role: volunteer.role ? `• ${volunteer.role}` : '',
            responsibilities: volunteer.responsibilities ? `• ${volunteer.responsibilities}` : '',
            date: `${volunteer.date_from ? formatDate(volunteer.date_from) : '' } - ${volunteer.currently_volunteering ? 'Present' : volunteer.date_to ? formatDate(volunteer.date_to) : '' }`,
            last: index !== resumeData.volunteerAndLeadershipActivities!.volunteer_list!.length - 1,
            volunteer_type: volunteer.is_aviation ? 'Aviation' : 'Non-Aviation',
            // Add the new array fields
            roleArray: volunteer.role ? volunteer.role.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            responsibilitiesArray: volunteer.responsibilities ? volunteer.responsibilities.split('\n').filter(responsibility => responsibility.trim()).map(responsibility => ({ bullet: `${responsibility.trim()}` })) : []
        })) || [];
    } else if (template === ResumeTemplate.TEMPLATE_4) {
        mappedData.professional_experience = resumeData.professionalExperience?.map(exp => {
            return {
                company: exp.company || '',
                location: exp.job_location ? ` : ${exp.job_location}` : '', // Add ":" only if location exists
                job_title: exp.job_title || '',
                aircraft: exp.aircraft ? `, ${exp.aircraft}` : '', // Add "," only if aircraft exists
                employment_dates: `${exp.date_from ? formatDate(exp.date_from) : '' } - ${exp.currently_employed ? 'Present' : exp.date_to ? formatDate(exp.date_to) : '' }`,
        
                // Ensure key_role and highlights are included
                key_role: exp.keyrole || '',
                highlights: exp.highlight_roles_exp || '',
                key_roles_arr: exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            highlight_roles_arr: exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `${highlight.trim()}` })) : [],
        
                // Merge key roles and highlights into one formatted block
                key_role_highlights: exp.keyrole || exp.highlight_roles_exp 
                ? [
                    ...exp.keyrole?.split('\n').filter(role => role.trim()).map((role, index) => {
                        const highlight = exp.highlight_roles_exp?.split('\n')[index]?.trim() || '';
                        return { bullet: role.trim() };
                    }) || [],
                    // If there are extra highlights without corresponding key roles, add them separately
                    ...exp.highlight_roles_exp?.split('\n').filter(highlight => highlight.trim()).map(highlight => ({
                        bullet: highlight.trim()
                    })) || []
                ]
                : []
                };
        }) || [];

        mappedData.education = resumeData.education?.map(edu => ({
            school_name: edu.school_name || '',
            degree: edu.degree || '',
            concentration: edu.concentration || '',
            minor_con: edu.minor_concentration || '',
            college_period: `${edu.date_from ? formatDate(edu.date_from) : ''} - ${edu.date_to ? formatDate(edu.date_to) : ''}`,
            college_location: edu.location || '',
            gpa: edu.gpa || '',
            honors: edu.honors || '',
            has_honors: edu.honors ? true : false,
        
            // New formatted fields
            degree_concentration: edu.degree || edu.concentration
                ? `\t•  ${[edu.degree, edu.concentration].filter(Boolean).join(', ')}`
                : '', // Remove empty values and format with ", "
        
            minor_gpa: edu.minor_concentration || edu.gpa
                ? `\t•  ${[edu.minor_concentration, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' ')}`
                : '' // Remove empty values
        })) || [];

        mappedData.volunteer = resumeData.volunteerAndLeadershipActivities?.volunteer_list?.map((volunteer, index) => ({
            organization: volunteer.organization || '',
            role: volunteer.role || '',
            responsibilities: volunteer.responsibilities ? `\t• ${volunteer.responsibilities.replace(/\n/g, '\n\t• ')}` : '',
            date: `${volunteer.date_from ? formatDate(volunteer.date_from) : '' } - ${volunteer.currently_volunteering ? 'Present' : volunteer.date_to ? formatDate(volunteer.date_to) : '' }`,
            last: index !== resumeData.volunteerAndLeadershipActivities!.volunteer_list!.length - 1,
            volunteer_type: volunteer.is_aviation ? 'Aviation' : 'Non-Aviation',
            // Add the new array fields
            roleArray: volunteer.role ? volunteer.role.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            responsibilitiesArray: volunteer.responsibilities ? volunteer.responsibilities.split('\n').filter(responsibility => responsibility.trim()).map(responsibility => ({ bullet: `${responsibility.trim()}` })) : []
        })) || [];
        console.log(mappedData)
    } else if (template === ResumeTemplate.TEMPLATE_5) {
        // Format certificates as a comma-separated string
        const certificates = resumeData.certificatesAndRatings?.certificates
        ?.filter(cert => cert.trim()) // Remove empty values
        .join(', ') || '';

        // Format ratings: First one should have "Type Ratings: ", others should be comma-separated
        const ratingsList = resumeData.certificatesAndRatings?.pic_sic_ratings
        ?.map(rating => rating.rating?.trim())
        .filter(r => r); // Remove empty values

        const typeRatings = ratingsList && ratingsList.length ? `Type Ratings: ${ratingsList.join(', ')}` : '';

        mappedData.professional_experience = resumeData.professionalExperience?.map(exp => ({
            job_title: exp.job_title || '',
            company: exp.company ? `: ${exp.company}` : '',
            location: exp.job_location || '',
            employment_dates: `${exp.date_from ? formatDate(exp.date_from) : '' } - ${exp.currently_employed ? 'Present' : exp.date_to ? formatDate(exp.date_to) : '' }`,
            key_role: exp.keyrole,
            highlights: exp.highlight_roles_exp,
            aircraft: exp.aircraft ? ` – ${exp.aircraft}` : '', // Add " – " only if aircraft exists
             // Merge key roles and highlights into one formatted block
             key_roles_arr: exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
            highlight_roles_arr: exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `${highlight.trim()}` })) : [],
             key_role_highlights: [
                ...(exp.keyrole ? exp.keyrole.split('\n').filter(role => role.trim()).map(role => ({ bullet: `-  ${role.trim()}` })) : []),
                ...(exp.highlight_roles_exp ? exp.highlight_roles_exp.split('\n').filter(highlight => highlight.trim()).map(highlight => ({ bullet: `-  ${highlight.trim()}` })) : [])
            ]
        })) || [];

        // awards, recognitions and achievements
        mappedData.award_info =  resumeData.additionalInformation?.award_recognition_list?.map((award, index) => ({
            award_recognition: `\t${award.award_recognition}` || '',
            date: award.date ? `${formatDate(award.date)}` : '',
            last: index !== resumeData.additionalInformation!.award_recognition_list!.length - 1,

        })) || [];

        mappedData.achievements = resumeData.additionalInformation?.achievement_list?.map((achievement, index) => ({
            achievement: `\t${achievement.achievement}` || '',
            last: index !== resumeData.additionalInformation!.achievement_list!.length - 1,
        })) || [],

        mappedData.has_attainments = mappedData.has_achievement || mappedData.has_award_recognition
        // Activities
        mappedData.volunteer = resumeData.volunteerAndLeadershipActivities?.volunteer_list?.map((volunteer, index) => {
            // Join roles with commas
            const rolesString = volunteer.role 
                ? volunteer.role.split('\n').filter(role => role.trim()).join(', ') 
                : '';
            // Join responsibilities with commas
            const responsibilitiesString = volunteer.responsibilities 
                ? volunteer.responsibilities.split('\n').filter(resp => resp.trim()).join(', ') 
                : '';
                console.log("rolestring", rolesString , "responsibilitiesstring", responsibilitiesString);
    
            return {
                organization: volunteer.organization || ''  ,
                role: rolesString + (responsibilitiesString ? " | " + responsibilitiesString : ""), // Comma-separated roles
                responsibilities: responsibilitiesString , // Comma-separated responsibilities
                date: `${volunteer.date_from ? formatDate(volunteer.date_from) : '' } - ${volunteer.currently_volunteering ? 'Present' : volunteer.date_to ? formatDate(volunteer.date_to) : '' }`,
                last: index !== resumeData.volunteerAndLeadershipActivities!.volunteer_list!.length - 1,
                volunteer_type: volunteer.is_aviation ? 'Aviation' : 'Non-Aviation',
                roleArray: volunteer.role ? volunteer.role.split('\n').filter(role => role.trim()).map(role => ({ bullet: `${role.trim()}` })) : [],
                responsibilitiesArray: volunteer.responsibilities ? volunteer.responsibilities.split('\n').filter(resp => resp.trim()).map(resp => ({ bullet: `${resp.trim()}` })) : []
            };
        }) || [];
        const rolesList = resumeData.volunteerAndLeadershipActivities?.volunteer_list
        ?.map(volunteer => volunteer.role?.trim()) // Get only role values
        .filter(role => role); // Remove empty values

        mappedData.volunteer_roles = rolesList && rolesList.length ? rolesList.join(' | ') : '';


    }
    console.log("mappedData", mappedData)
    return mappedData;
}


function cleanObject(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(cleanObject).filter(item => Object.keys(item).length > 0);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) => value !== null && value !== '' && value !== undefined)
                .map(([key, value]) => [key, cleanObject(value)])
        );
    }
    return obj;
}


export const resumeDataField: ResumeFields = {
  personalInformation: {
    first_name: "John",
    last_name: "Doe",
    address_line_1: "1234 Aviation Blvd",
    address_line_2: "Apt 567",
    country: "USA",
    city: "Los Angeles",
    state: "CA",
    zipcode: "90001",
    phone_number: "555-123-4567",
    email: "johndoe@example.com",
    has_us_passport: true,
    authorized_work_in_US: true
  },
  certificatesAndRatings: {
    certificates: ["ATP", "CFI"],
    pic_sic_ratings: [
      {
        rating: "Boeing 737",
        privilege_type: "PIC",
      }
    ]
  },
  flightExperience: {
    military_sorties: 200,
    turbine: 1500,
    pic_turbine: 1200,
    total_flight_hours: 5000,
    total_time: 5000,
    total_pic_time: 3000,
    total_sic_time: 2000,
    multi_engine: 2500,
    total_amel_asel_time: 4000,
    total_instructor_time: 1000,
    total_instrument_flight_time: 1200,
    part_121_hours: 1800,
    part_121_PIC_hours: 900,
    part_135_hours: 500,
    part_135_PIC_hours: 300,
    major_flight_exp: "Extensive experience in commercial airline operations.",
    night_flight_hours: 600,
    has_commercial_privilege: true,
    commercial_privilege_exp: "Authorized to operate under Part 121 and Part 135.",
    aircraft_operated_list: [
      {
        aircraft: "Boeing 737",
        flight_hours: 2000,
        privilege_type: PrivilegeType?.PIC
      }
    ]
  },
  professionalExperience: [
    {
      job_title: "Captain",
      company: "Major Airlines",
      aircraft: "Boeing 737",
      date_from: new Date("2015-06-01"),
      date_to: new Date("2024-01-01"),
      keyrole: "Lead pilot ensuring safe flight operations.",
      highlight_roles_exp: "Successfully managed complex flight operations.",
      job_location: "New York, NY"
    }
  ],
  professionalDevelopment: {
    has_completed_training: true,
    training_list: ["Advanced Flight Safety", "Crew Resource Management"]
  },
  education: [
    {
      school_name: "Aviation University",
      degree: "Bachelor of Science",
      concentration: "Aerospace Engineering",
      gpa: 3.8,
      honors: "Cum Laude",
      date_from: new Date("2010-08-01"),
      date_to: new Date("2014-05-01"),
      location: "Houston, TX"
    }
  ],
  volunteerAndLeadershipActivities: {
    has_volunteer_role: true,
    volunteer_list: [
      {
        organization: "Pilots for Kids",
        role: "Volunteer Pilot",
        is_aviation: true,
        date_from: new Date("2018-01-01"),
        date_to: new Date("2018-12-12"),
        responsibilities: "Organized aviation-themed events for children."
      }
    ]
  },
  additionalInformation: {
    award_recognition_list: [
      {
        award_recognition: "Best Pilot of the Year",
        date: new Date("2020-12-01")
      }
    ],
    achievement_list: [
      {
        achievement: "Successfully completed over 5000 flight hours."
      }
    ]
  }
};








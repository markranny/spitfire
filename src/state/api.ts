import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { FlightAggregates, SimpleFlightAggregates } from "@/lib/interfaces/flightAggregates";
import { User } from "@/lib/getUser";
import { InsertResume } from "@/db/drizzle/schema/resume";
import { ResumeFields } from "@/types/api/requests";

const customBaseQuery = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: any) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api`,
    prepareHeaders: async (headers) => {
      // const token = await window.Clerk?.session?.getToken();
      // if (token) {
      //   headers.set("Authorization", `Bearer ${token}`);
      // }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorData = result.data?.data || result.data;
      const errorMessage = errorData?.message || result.error.status.toString() || "An Error Occured";
      if (result.error.status !== 404) {
        toast.error(`Error: ${errorMessage}`);
      }
    }
    const isMutationRequest = (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result.data?.message;
      console.log(result);
      if (successMessage && result.success) {
        toast.success(successMessage);
      }
    }
    if (result.data) {
      result.data = result.data.data || result.data;
    } else if (result.error?.status === 204 || result.meta?.response.status === 24) {
      return { data: null };
    }

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return { error: { status: 500, data: { message: errorMessage } } };
  }
};
interface ResumeResponse {
  data: ArrayBuffer; // Binary data for the file
}

// Define the request parameters
interface GenerateResumeParams {
  template: string; // "1" | "2" | "3" | "4" | "5"
  fileType: "pdf" | "docx";
  resumeData: any;
}
interface FlightLog {
  id?: string; // Assuming flightLogs has an id
  userId: string;
  [key: string]: any; // Add other fields from your flightLogs schema
}

// Define the column definition type (based on your interface)
interface FlightColumnDefinition {
  [key: string]: any; // Adjust based on flightColumnDefinitions structure
}
interface GetFlightLogsResponse {
  success: boolean;
  flights: FlightLog[];
  availableColumns: FlightColumnDefinition[];
  error?: string;
}
interface GetScorecardFlightAggregatesResponse {
  success: boolean;
  aggregates: FlightAggregates;
}
interface GetSimpleFlightAggregatesResponse {
  success: boolean;
  aggregates: SimpleFlightAggregates;
}
interface GetUserResponse {
  success: boolean;
  user: User;
}
interface UpdateFlightLog {
  flightId: string;
  updatedFlight: any;
}
interface DeleteFlightLog {
  flightId: string;
}
interface BasicResponse {
  success: boolean;
  message?: string;
}

interface ResumeApiResponse {
  success: boolean;
  resumeData?: any; // Adjust type based on your resumeData structure
  error?: string;
}

interface CreateResumeParams {
  resumeData: any; // Adjust type based on your resumeData structure
}

interface UpdateResumeParams {
  id: string;
  resumeData: any; // Adjust type based on your resumeData structure
}

interface DeleteResumeParams {
  id: string;
}

type GetResumesResponse = {
  success: boolean;
  resumeList?: InsertResume[]; // Replace 'Resume' with your actual Resume type
  error?: string;
};

export interface Submission {
  id: string;
  userId: string;
  resumeId: string;
  state: string;
  name: string;
  email: string;
  airlinePreference: string;
  position?: string;
  selectedTemplates: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SaveSubmissionRequest {
  submission: {
    resumeId: string;
    name: string;
    email: string;
    airlinePreference: string;
    position?: string;
    selectedTemplates: string[];
  }
}

interface UpdateSubmissionRequest {
  submission: {
    id: string;
    state?: string;
    name?: string;
    email?: string;
    airlinePreference?: string;
    position?: string;
    selectedTemplates?: string[];
  }
}

interface UpdateSubmissionResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

interface GetSubmissionsResponse {
  success: boolean;
  submissions: {
    submission: Submission;
    resume: ResumeFields;
  }[];
}

interface SaveSubmissionResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

interface GetSubmissionResponse {
  success: boolean;
  submission?: Submission;
  resume?: ResumeFields;
  error?: string;
}

interface DeleteSubmissionResponse {
  success: boolean;
  error?: string;
}

interface GenerateJobDescriptionResponse {
  success: boolean;
  description?: string;
}

interface GenerateJobDescriptionRequest {
  description: string;
  company?: string;
  title?: string;
  aircraft?: string;
}

interface GenerateVolunteeringRoleRequest {
  role: string;
  organization?: string;
  volunteer_type?: string;
}

interface GenerateVolunteeringRoleResponse {
  success: boolean;
  role?: string;
}

interface GenerateVolunteeringResponsibilitiesRequest {
  responsibilities: string;
  organization?: string;
  volunteer_type?: string;
}

interface GenerateVolunteeringResponsibilitiesResponse {
  success: boolean;
  responsibilities?: string;
}

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Submissions", "Users", "Resume", "FlightLogs", "Course"],
  endpoints: (build) => ({
    generateResume: build.mutation<ResumeResponse, GenerateResumeParams>({
      query: ({ template, fileType, resumeData }) => ({
        url: "resume", // Adjust endpoint URL as needed
        method: "POST",
        params: {
          template,
          fileType,
        },
        body: resumeData,
        responseHandler: async (response) => ({
          data: await response.arrayBuffer(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Optional: Add tags if you need caching/invalidation
      invalidatesTags: ["Resume"],
    }),
    getUser: build.query<GetUserResponse, void>({
      query: () => ({
        url: "user",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    processFlightLogs: build.mutation<FlightLogResponse, ProcessFlightLogParams>({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        return {
          url: "scorecard/upload",
          method: "POST",
          body: formData,
        };
      },

      transformResponse: (response: FlightLogResponse) => {
        if (!response?.success) {
          throw new Error(response.message || "Failed to process flight logs");
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        return {
          success: false,
          message: response.data?.message || "Error processing flight logs",
        };
      },
    }),
    createFlightLogs: build.mutation<CreateFlightLogsResponse, CreateFlightLogsParams>({
      query: ({ logs }) => ({
        url: "scorecard/save", // Adjust this to match your actual API route
        method: "POST",
        body: { logs },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["FlightLogs"], // Invalidate FlightLogs cache if you fetch them elsewhere
    }),
    getFlightLogs: build.query<GetFlightLogsResponse, void>({
      query: () => ({
        url: "scorecard/flights", // Adjust this to match your actual API route
        method: "GET",
      }),
      providesTags: ["FlightLogs"], // Tag for caching/invalidation
    }),
    getScorecardFlightAggregates: build.query<GetScorecardFlightAggregatesResponse, void>({
      query: () => ({
        url: "scorecard/aggregates", // Adjust this to match your actual API route
        method: "GET",
        params: {
          aggregateType: "scorecard",
        },
      }),
      providesTags: ["FlightLogs"], // Tag for caching/invalidation
    }),
    getSimpleFlightAggregates: build.query<GetSimpleFlightAggregatesResponse, { military: boolean | undefined }>({
      query: ({ military }) => ({
        url: "scorecard/aggregates", // Adjust this to match your actual API route
        method: "GET",
        params: {
          aggregateType: "simple",
          military: military === true ? "true" : military === false ? "false" : undefined,
        },
      }),
      providesTags: ["FlightLogs"], // Tag for caching/invalidation
    }),
    updateFlightLog: build.mutation<BasicResponse, UpdateFlightLog>({
      query: (updateFlightLog) => ({
        url: `scorecard/flights`, // Adjust this to match your actual API route
        method: "PUT",
        body: {
          flightId: updateFlightLog.flightId,
          updatedFlight: updateFlightLog.updatedFlight,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { flightId }) => [{ type: "FlightLogs", flightId }], // Invalidate the specific flight log
    }),
    deleteFlightLog: build.mutation<BasicResponse, DeleteFlightLog>({
      query: (deleteFlightLog) => ({
        url: `scorecard/flights`, // Adjust this to match your actual API route
        body: { flightId: deleteFlightLog.flightId },
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: (result, error, { flightId }) => [{ type: "FlightLogs", flightId }], // Invalidate the specific flight log
    }),
    deleteAllFlightLogs: build.mutation<BasicResponse, void>({
      query: () => ({
        url: `scorecard/delete`, // Adjust this to match your actual API route
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["FlightLogs"], // Invalidate all flight logs
    }),
    getResumes: build.query<GetResumesResponse, void>({
      query: () => ({
        url: "resume",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Resume"], // Cache the list of resumes
    }),
    getResume: build.query<ResumeApiResponse, string>({
      query: (id) => ({
        url: `resume/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: (result, error, id) => [{ type: "Resume", id }],
    }),
    createResume: build.mutation<ResumeApiResponse, CreateResumeParams>({
      query: ({ resumeData }) => ({
        url: "resume/save",
        method: "POST",
        body: { resumeData },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Resume"],
    }),
    updateResume: build.mutation<ResumeApiResponse, UpdateResumeParams>({
      query: ({ id, resumeData }) => ({
        url: `resume/${id}`,
        method: "PUT",
        body: { resumeData },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Resume", "Submissions"],
    }),
    deleteResume: build.mutation<ResumeApiResponse, DeleteResumeParams>({
      query: ({ id }) => ({
        url: `resume/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Resume"],
    }),
    saveSubmission: build.mutation<SaveSubmissionResponse, SaveSubmissionRequest>({
      query: (request) => ({
        url: "submission",
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Submissions"],
    }),
    getSubmissions: build.query<GetSubmissionsResponse, void>({
      query: () => ({
        url: "submission",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Submissions"],
    }),
    deleteSubmission: build.mutation<DeleteSubmissionResponse, string>({
      query: (id) => ({
        url: `submission/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Submissions"],
    }),
    getSubmission: build.query<GetSubmissionResponse, string>({
      query: (id) => ({
        url: `submission/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Submissions"],
    }),
    getSubmissionByResumeId: build.query<GetSubmissionResponse, string>({
      query: (resumeId) => ({
        url: `submission/resume/${resumeId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Submissions"],
    }),
    updateSubmission: build.mutation<UpdateSubmissionResponse, UpdateSubmissionRequest>({
      query: ({ submission }) => ({
        url: `submission/${submission.id}`,
        method: "PUT",
        body: { submission },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Submissions"],
    }),
    getAdminSubmissions: build.query<GetSubmissionsResponse, void>({
      query: () => ({
        url: "admin/submission",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Submissions"],
    }),
    generateJobDescription: build.mutation<GenerateJobDescriptionResponse, GenerateJobDescriptionRequest>({
      query: (request) => ({
        url: `admin/generate-job-description`,
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    generateVolunteeringRole: build.mutation<GenerateVolunteeringRoleResponse, GenerateVolunteeringRoleRequest>({
      query: (request) => ({
        url: `admin/generate-volunteering-role`,
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    generateVolunteeringResponsibilities: build.mutation<GenerateVolunteeringResponsibilitiesResponse, GenerateVolunteeringResponsibilitiesRequest>({
      query: (request) => ({
        url: `admin/generate-volunteering-responsibilities`,
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useGenerateResumeMutation,
  useProcessFlightLogsMutation,
  useCreateFlightLogsMutation,
  useUpdateFlightLogMutation,
  useDeleteFlightLogMutation,
  useGetFlightLogsQuery,
  useGetScorecardFlightAggregatesQuery,
  useGetSimpleFlightAggregatesQuery,
  useDeleteAllFlightLogsMutation,
  useGetUserQuery,
  useGetResumeQuery,
  useGetResumesQuery,
  useCreateResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useSaveSubmissionMutation,
  useGetSubmissionsQuery,
  useDeleteSubmissionMutation,
  useGetSubmissionQuery,
  useGetSubmissionByResumeIdQuery,
  useUpdateSubmissionMutation,
  useGetAdminSubmissionsQuery,
  useGenerateJobDescriptionMutation,
  useGenerateVolunteeringRoleMutation,
  useGenerateVolunteeringResponsibilitiesMutation,
} = api;

"use client";
import React from "react";
import { Submission, useGetSubmissionsQuery } from "@/state/api";
import Loading from "@/components/Loading";
import { ResumeFields } from "@/types/api/requests";
import { Edit, Trash } from "lucide-react";
import SubmissionState from "@/lib/interfaces/submissionState";
import { useAppDispatch } from "@/state/redux";
import { setActiveSession } from "@/state";
import { useRouter } from "next/navigation";
import useSubmissions from "@/hooks/useSubmissions";
import useResume from "@/hooks/useResume";

const SubmissionsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { refetchExistingSubmission, deleteSubmission } = useSubmissions();
  const { refetchResume } = useResume();
  
  const {
    data: allSubmissionsData,
    error: getSubmissionsError,
    isLoading: isGetSubmissionsLoading,
  } = useGetSubmissionsQuery();

  const formatName = (resume: ResumeFields) => {
    if (!resume) return "—";
    return `${resume?.personalInformation?.first_name || ""} ${resume?.personalInformation?.last_name || ""}`.trim() || "";
  };

  const formatState = (state: string) => {
    switch (state) {
      case SubmissionState.NEEDS_REVIEW:
        return "Awaiting admin review";
      case SubmissionState.PROCESSING:
        return "Processing";
      case SubmissionState.APPROVED_AND_SENT:
        return "Resume sent";
      default:
        return state;
    }
  };

  const formatStateColor = (state: string) => {
    switch (state) {
      case SubmissionState.NEEDS_REVIEW:
        return "#9A3838";
      case SubmissionState.PROCESSING:
        return "#38599A";
      case SubmissionState.APPROVED_AND_SENT:
        return "#389A43";
      default:
        return state;
    }
  };

  const handleChangeContactTemplate = (submission: Submission, resume: ResumeFields) => {
    dispatch(setActiveSession(submission.resumeId));
    refetchExistingSubmission();
    router.push("/resume?step=9");
  };

  const handleEditSubmission = (submission: Submission) => {
    try {
      dispatch(setActiveSession(submission.resumeId));
      refetchResume();
      refetchExistingSubmission();
    } catch (error) {
      console.log("Error refetching submission:", error);
    }
    router.push("/resume?step=1");
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (confirm("Are you sure you want to delete this submission? This action cannot be undone.")) {
      // Call the delete submission function from the hook
      await deleteSubmission(submissionId);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full pl-12 py-12 pr-24">
        <h1 className="text-2xl font-semibold text-black">Submissions</h1>
        <p className="text-customgreys-dirtyGrey text-md pt-5">Edit submission and check status of your resume.</p>
        {isGetSubmissionsLoading ? (
          <div>
            <Loading />
          </div>
        ) : getSubmissionsError ? (
          <p>Error loading submissions: {getSubmissionsError.message}</p>
        ) : (
          <div className="mt-4">
            {allSubmissionsData && allSubmissionsData?.submissions.length > 0 ? (
              <ul>
                {allSubmissionsData.submissions.map((submissionData, idx) => {
                  const submission = submissionData?.submission;
                  const resume = submissionData?.resume;
                  // Format date
                  const dateSubmitted = submission?.createdAt
                    ? new Date(submission.createdAt).toLocaleDateString()
                    : "—";
                  return (
                    <li key={submission.id} className="mb-6 h-full w-full">
                      <div className="flex items-start border border-black rounded-2xl px-6 py-5 relative bg-white shadow-sm min-w-[500px] max-w-[700px]">
                        {/* Number box */}
                        <div
                          className="absolute bg-white border border-black rounded-tl-2xl rounded-br-lg px-4 py-2 flex items-center justify-center font-bold text-lg shadow-sm select-none"
                          style={{
                            borderWidth: "2px",
                            color: "black",
                            left: "-0.5px",
                            top: "-1px",
                            minWidth: '36px'
                          }}
                        >
                          {idx + 1}
                        </div>
                        {/* Content */}
                        <div className="flex-1 flex-col pl-8">
                          <div className="font-semibold text-black text-base mb-1">Pilot Name</div>
                          <div className="text-black text-sm mb-2">{formatName(resume)}</div>
                          <div className="font-semibold text-black text-base mb-1">Date Submitted</div>
                          <div className="text-black text-sm mb-2">{dateSubmitted}</div>
                          <div className="font-bold text-base mt-2 mb-0" style={{ color: formatStateColor(submission.state) }}>
                            Status: <span className="font-bold">{formatState(submission.state)}</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col min-h-full justify-between items-end">
                          <div className="flex">
                            <button className="p-2" title="Edit" onClick={() => handleEditSubmission(submission)}>
                              <Edit size={20} className="text-black" />
                            </button>
                            <button className="p-2" title="Delete" onClick={() => handleDeleteSubmission(submission.id)}>
                              <Trash size={20} className="text-black" />
                            </button>
                          </div>
                          <div className="flex mt-12">
                            <button
                              className="flex border border-orange-500 text-orange-500 hover:bg-orange-50 px-5 py-1 rounded-full font-semibold text-sm transition-colors"
                              onClick={() => handleChangeContactTemplate(submission, resume)}
                            >
                              Change Contact/Template
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="font-bold text-black">No submissions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;

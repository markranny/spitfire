"use client";
import React, { useEffect, useMemo, useState } from "react";
import { setActiveSession } from "@/state";
import { Submission, useGetAdminSubmissionsQuery, useUpdateSubmissionMutation } from "@/state/api";
import { ResumeFields } from "@/types/api/requests";
import SubmissionState from "@/lib/interfaces/submissionState";
import { useAppDispatch } from "@/state/redux";
import { useRouter } from "next/navigation";
import useSubmissions from "@/hooks/useSubmissions";
import { Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadFile, generateDocument, ResumeTemplate } from "@/lib/utils";
import Loading from "@/components/Loading";
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from "@/components/ui/select";
import useResume from "@/hooks/useResume";
import { CustomFormField } from "@/components/CustomFormField";
import { SubmissionFiltersFormData, SubmissionFiltersSchema } from "@/lib/schemas";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

const ResumeRequestsPage: React.FC = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeFields | null>(null);
  const { data: submissionsData, isLoading } = useGetAdminSubmissionsQuery();
  const methods: UseFormReturn<SubmissionFiltersFormData> = useForm<SubmissionFiltersFormData>({
    resolver: zodResolver(SubmissionFiltersSchema),
    defaultValues: {},
  });
  const isSameDay = (date1: string | Date, date2: string | Date) => {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  };
  const filters = methods.watch();
  const filteredSubmissions = useMemo(() => {
    const submissions = submissionsData?.submissions || [];
    return submissions.filter((submissionData) => {
      const submission: Submission = submissionData.submission as Submission;
      const resume: ResumeFields = submissionData.resume;

      const { state, name, email, date } = filters;
      const matchesState = state ? (submission.state === state || state === "all") : true;
      const resumeName = resume?.personalInformation?.first_name + " " + resume?.personalInformation?.last_name;
      const matchesName = name ? resumeName.toLowerCase().includes(name.toLowerCase()) : true;
      const matchesEmail = email ? submission.email.includes(email) : true;
      const matchesDate = date ? isSameDay(submission.createdAt, date) : true;
      return matchesState && matchesName && matchesEmail && matchesDate;
    }).sort((a, b) => {
      const dateA = new Date(a.submission.createdAt);
      const dateB = new Date(b.submission.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });
  }, [submissionsData, filters]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black text-uppercase">Review and Send Resumes</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Review, edit, and send resumes.</p>
      <ul className="mt-8">
        <SubmissionFilters methods={methods} />
        {filteredSubmissions?.map((submission, index) => (
          <SubmissionItem
            key={submission.submission.id}
            index={index}
            submission={submission.submission}
            resume={submission.resume}
            handleShowDownloadModal={(_, resume) => {
              setSelectedResume(resume);
              setIsDownloadModalOpen(true);
            }}
          />
        ))}
      </ul>
      {selectedResume && (
        <DownloadModal
          resume={selectedResume}
          isOpen={isDownloadModalOpen}
          setIsOpen={setIsDownloadModalOpen}
        />
      )}
    </div>
  );
};

interface SubmissionFiltersProps {
  methods: UseFormReturn<SubmissionFiltersFormData>;
}
const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({ methods }) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex gap-4">
        <Form {...methods}>
          <form className="flex gap-4 w-full">
            <CustomFormField
              name="name"
              label="Search Pilot Name"
              type="text"
              placeholder="Pilot Name"
              inputClassName="text-black"
            />
            <CustomFormField
              name="email"
              label="Search Pilot Email"
              placeholder="Pilot Email"
              inputClassName="text-black"
            />
            <CustomFormField
              name="state"
              label="Filter State"
              type="select"
              placeholder="Select State"
              inputClassName="text-black bg-white"
              options={[
                { value: "all", label: "All States" },
                { value: SubmissionState.NEEDS_REVIEW, label: "Needs Review" },
                { value: SubmissionState.PROCESSING, label: "Processing" },
                { value: SubmissionState.APPROVED_AND_SENT, label: "Approved and Sent" },
              ]}
            />
            <CustomFormField
              name="date"
              label="Filter Submission Date"
              type="date"
              inputClassName="text-black"
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

interface DownloadModalProps {
  resume: ResumeFields;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const DownloadModal: React.FC<DownloadModalProps> = ({ resume, isOpen, setIsOpen }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const formatFileName = (resume: ResumeFields) => {
    const firstName = resume?.personalInformation?.first_name || "Pilot";
    const lastName = resume?.personalInformation?.last_name || "Resume";
    return `${firstName} ${lastName} Resume ${new Date().toLocaleDateString()}`;
  };
  const downloadPdf = () => {
    if (!selectedTemplate) return;
    generateDocument(selectedTemplate, resume, async (result: GenerateDocumentResult) => {
      const pdfBlob = await result.getPdf();
      downloadFile(formatFileName(resume), "pdf", pdfBlob);
      handleClose();
    });
  };
  const downloadDocx = () => {
    if (!selectedTemplate) return;
    generateDocument(selectedTemplate, resume, async (result: GenerateDocumentResult) => {
      const docxBlob = await result.getDocx();
      downloadFile(formatFileName(resume), "docx", docxBlob);
      handleClose();
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSelectedTemplate(null);
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white-50">
        <DialogTitle className="text-black font-semibold text-lg text-center">Download Resume</DialogTitle>
        {!selectedTemplate && (
          <div className="flex flex-col items-center justify-center pt-5">
            <p className="text-black text-md mb-4">Please select a template to download the resume:</p>
            <div className="grid grid-cols-5 gap-4">
              {Object.values(ResumeTemplate).map((template) => (
                <Button
                  key={template}
                  type="button"
                  className="w-full px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-full shadow-md text-sm font-semibold"
                  onClick={() => setSelectedTemplate(template)}
                >
                  Template {template}
                </Button>
              ))}
            </div>
          </div>
        )}
        {selectedTemplate && (
          <div className="pt-5 w-full flex items-center gap-2 justify-center">
            <Button
              type="button"
              className="w-fit min-w-32 px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-300 rounded-full shadow-md text-sm font-semibold"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={downloadPdf}
              className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold"
            >
              Download PDF
            </Button>
            <Button
              type="button"
              onClick={downloadDocx}
              className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold"
            >
              Download DOCX
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SubmissionItemProps {
  index: number;
  submission: Submission;
  resume: ResumeFields;
  handleShowDownloadModal: (submission: Submission, resume: ResumeFields) => void;
};
const SubmissionItem: React.FC<SubmissionItemProps> = ({ index, submission, resume, handleShowDownloadModal }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { refetchExistingSubmission, deleteSubmission } = useSubmissions();
  const { refetchResume } = useResume();
  const [updateSubmission, { isLoading: isUpdateLoading, error: updateError }] = useUpdateSubmissionMutation();
  
  const dateSubmitted = submission?.createdAt
    ? new Date(submission.createdAt).toLocaleDateString()
    : "—";

  const formatName = (resume: ResumeFields) => {
    if (!resume) return "—";
    return `${resume?.personalInformation?.first_name || ""} ${resume?.personalInformation?.last_name || ""}`.trim() || "";
  };

  const formatState = (state: string) => {
    switch (state) {
      case SubmissionState.NEEDS_REVIEW:
        return "Awaiting review";
      case SubmissionState.PROCESSING:
        return "Processing";
      case SubmissionState.APPROVED_AND_SENT:
        return "Approved and sent";
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

  const handleStatusChange = async (newState: string) => {
    try {
      await updateSubmission({
        submission: {
          id: submission.id,
          state: newState,
        }
      });
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };

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
          {index + 1}
        </div>
        {/* Content */}
        <div className="flex flex-col pl-8 mr-2">
          <div className="font-semibold text-black text-base mb-1">Pilot Name</div>
          <div className="text-black text-sm mb-2">{formatName(resume)}</div>
          <div className="font-bold text-black text-base mb-0 flex items-center flex-wrap">
            <span className="flex w-full">Status</span>
            <span className="w-auto flex-shrink-1 bg-white position-relative" style={{ left: "-1rem" }}>
              <Select
                value={submission.state}
                onValueChange={(value) => handleStatusChange(value)}
              >
                <SelectTrigger
                  className="w-full bg-white text-black border-black rounded-md background-transparent"
                  style={{
                    color: formatStateColor(submission.state),
                  }}
                >
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black font-bold">
                  {[SubmissionState.NEEDS_REVIEW, SubmissionState.PROCESSING, SubmissionState.APPROVED_AND_SENT].map((state, index) => (
                    <SelectItem key={index} value={state} style={{
                      color: formatStateColor(state),
                    }}>
                      {formatState(state)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
          </div>
        </div>
        <div className="flex flex-col mr-2">
          <div className="font-semibold text-black text-base mb-1">Email</div>
          <div className="text-black text-sm mb-2">{submission.email || "—"}</div>
          <div className="font-semibold text-black text-base mb-1">Date Submitted</div>
          <div className="text-black text-sm mb-2">{dateSubmitted}</div>
        </div>
        <div className="flex flex-col w-full">
          <div className="font-semibold text-black text-base mb-1">Airline</div>
          <div className="text-black text-sm mb-2">{submission.airlinePreference || "—"}</div>
          <div className="font-semibold text-black text-base mb-1">Position</div>
          <div className="text-black text-sm mb-2">{submission.position || "—"}</div>
          <div className="font-semibold text-black text-base mb-1">Templates</div>
          <div className="text-black text-sm mb-2">
            {submission.selectedTemplates && submission.selectedTemplates.length > 0
              ? submission.selectedTemplates.filter(template => !!template).join(", ")
              : "—"}
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-col w-full justify-between items-end">
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
              onClick={() => handleShowDownloadModal(submission, resume)}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </li>  
  );
}

export default ResumeRequestsPage;

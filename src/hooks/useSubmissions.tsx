"use client";

import { useSaveSubmissionMutation, useGetSubmissionsQuery, useDeleteSubmissionMutation, useUpdateSubmissionMutation, useGetSubmissionByResumeIdQuery } from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useMemo } from "react";

const useSubmissions = () => {
  const [createSubmission, { isLoading: isCreateLoading, error: createError }] = useSaveSubmissionMutation();
  const [updateSubmission, { isLoading: isUpdateLoading, error: updateError }] = useUpdateSubmissionMutation();
  const [deleteSubmission, { isLoading: isDeleteLoading, error: deleteError }] = useDeleteSubmissionMutation();
  const { activeSession } = useAppSelector((state) => state.global);
  const { data: submissionData, isLoading: isExistingSubmissionLoading, refetch: refetchExistingSubmission } = useGetSubmissionByResumeIdQuery(activeSession || "", {
    skip: !activeSession,
  });

  async function saveSubmission(data: any) {
    const submissionId = submissionData?.submission?.id;

    if (submissionId) {
      await updateSubmission({ submission: {
        id: submissionId,
        ...data,
      }});
    } else {
      await createSubmission({ submission: data })
    }
  }

  const isSaving = useMemo(() => isCreateLoading || isUpdateLoading, [isCreateLoading, isUpdateLoading]);

  return {
    existingSubmission: submissionData?.submission,
    refetchExistingSubmission,
    isExistingSubmissionLoading,
    saveSubmission,
    isSaving,
    deleteSubmission,
    submissionSaving: isCreateLoading || isUpdateLoading,
    submissionSavingError: createError || updateError,
  };
};

export default useSubmissions;

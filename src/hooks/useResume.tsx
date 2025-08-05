"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect } from "react";
import { useUser } from "./useUser";
import { useCreateResumeMutation, useGetResumeQuery, useUpdateResumeMutation } from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveSession, setFormData } from "@/state";

const useResume = () => {
  const [createResume, { isLoading: isCreateLoading, error: createError }] = useCreateResumeMutation();
  const [updateResume, { isLoading: isUpdateLoading, error: updateError }] = useUpdateResumeMutation();
  const { formData, activeSession } = useAppSelector((state) => state.global);
  const {
    data: resumeData,
    error: resumeError,
    isLoading: isResumeLoading,
    refetch: refetchResume,
  } = useGetResumeQuery(activeSession ?? "", {
    skip: !activeSession, 
    refetchOnMountOrArgChange: true,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (activeSession && !isResumeLoading && (!resumeData?.success || resumeError)) {
      console.warn("Invalid activeSession detected, clearing session.");
      localStorage.removeItem("activeSession");
      dispatch(setActiveSession(null));
    } else if (activeSession) {
      localStorage.setItem("activeSession", activeSession);
      refetchResume();
    }
  }, [activeSession, resumeData, resumeError, isResumeLoading, dispatch]);

  useEffect(() => {
    if (resumeData?.resumeData) {
      dispatch(setFormData(resumeData.resumeData));
    }
  }, [resumeData, dispatch, setFormData]);

  async function saveResumeData(data: any) {
    let response: any;
    if (activeSession) {
      response = await updateResume({ id: activeSession, resumeData: data }).unwrap();
    } else {
      response = await createResume({ resumeData: data }).unwrap();
      if (response.success && response.resume?.id) {
        localStorage.setItem("activeSession", response.resume.id);
        dispatch(setActiveSession(response?.resume?.id)); 
      }
    }
  }
  return {
    saveResumeData,
    refetchResume,
    resumeSaving: isCreateLoading || isUpdateLoading,
    resumeSavingError: createError || updateError,
  };
};

export default useResume;

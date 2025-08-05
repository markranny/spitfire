"use client";

import React, { useEffect } from "react";
import ContactInformationForm from "./ContactInformationForm";
import Loading from "@/components/Loading";
import { useGetSubmissionByResumeIdQuery } from "@/state/api";
import { useAppSelector } from "@/state/redux";

const ContactInformation = () => {
  const { activeSession } = useAppSelector((state) => state.global);
  const { data: existingSubmission, isLoading: isExistingSubmissionLoading } = useGetSubmissionByResumeIdQuery(activeSession || "", {
    skip: !activeSession,
  });

  if (isExistingSubmissionLoading) {
    return (
      <div className="w-full h-full position-absolute items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Contact Information</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out the information below</p>
      <ContactInformationForm existingSubmission={existingSubmission?.submission} />
    </div>
  );
};

export default ContactInformation;

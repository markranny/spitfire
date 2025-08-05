"use client";

import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import React, { useEffect } from "react";
import PersonalInformation from "./PersonalInformation";
import CertificatesRating from "./CertificatesRating";
import FlightExperience from "./FlightExperience";
import ProfessionalExperience from "./ProffesionalExperience";
import Education from "./Education";
import ProfessionalDevelopment from "./ProffesionalDevelopment";
import Volunteering from "./Volunteering";
import Additional from "./Additional";
import ContactInformation from "./ContactInformation";
import { useAppDispatch } from "@/state/redux";
import { setActiveSession } from "@/state";

const Home = () => {
  const { navigationStep } = useCheckoutNavigation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const activeSession = localStorage.getItem("activeSession");
    if (activeSession) {
      dispatch(setActiveSession(activeSession));
    }
  }, [dispatch]);
  const renderStep = (navigationStep: number) => {
    switch (navigationStep) {
      case 1:
        return <PersonalInformation />;
      case 2:
        return <CertificatesRating />;
      case 3:
        return <FlightExperience />;
      case 4:
        return <ProfessionalExperience />;
      case 5:
        return <ProfessionalDevelopment />;
      case 6:
        return <Education />;
      case 7:
        return <Volunteering />;
      case 8:
        return <Additional />;
      case 9:
        return <ContactInformation />;
      default:
        return <PersonalInformation />;
    }
  };
  return <div className="w-full h-full">{renderStep(navigationStep)}</div>;
};

export default Home;

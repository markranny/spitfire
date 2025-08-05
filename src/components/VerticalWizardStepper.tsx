"use client";

import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { setFormData } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useEffect } from "react";

const VerticalWizard = ({ currentStep }: { currentStep: number }) => {
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const WIZARD_STORAGE_KEY = "formData";

  useEffect(() => {
    const storedData = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      if (!isStepAccessible(navigationStep, data)) {
        navigateToStep(1);
      }
      dispatch(setFormData(data));
    } else {
      navigateToStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const steps = [
    { label: "Personal Information" },
    { label: "Certificates & Ratings" },
    { label: "Flight Experience" },
    { label: "Professional Experience" },
    { label: "Professional Development" },
    { label: "Education" },
    { label: "Volunteering" },
    { label: "Additional Information" },
    { label: "Preview" },
  ];

  // Helper function to check if all preceding steps are completed
  const isStepAccessible = (stepIndex: number, formData: any) => {
    if (stepIndex === 1) return true; // Step 1 is always accessible
    const completedSteps = formData.filter((step: any) => step.completed).map((step: any) => step.step);
    return completedSteps.includes(stepIndex - 1);
  };

  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const accessible = isStepAccessible(stepNumber, formData);
        return (
          <div
            key={index}
            className={`flex items-start gap-4 cursor-pointer ${accessible ? "" : "opacity-50 cursor-not-allowed"}`}
            onClick={() => accessible && navigateToStep(stepNumber)}
          >
            {/* Circle Node */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border-2
                  ${
                    currentStep === stepNumber
                      ? "border-blue-200 bg-white-100 text-black"
                      : "border-gray-300 text-gray-300"
                  } ${currentStep > stepNumber && "border-blue-200"}`}
              >
                {stepNumber}
              </div>

              {/* Dotted Line */}
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-4 flex-grow ${currentStep > stepNumber ? "border-blue-200" : "border-gray-300"}`}
                  style={{ borderLeft: "2px dotted" }}
                />
              )}
            </div>

            {/* Label */}
            <div
              className={`text-sm flex mt-1 items-center h-full xl:text-md lg:text-sm font-bold ${
                currentStep === stepNumber ? "text-blue-200" : "text-white"
              }`}
            >
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerticalWizard;

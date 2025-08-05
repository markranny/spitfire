"use client";

import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { ContactInformationSchema, ContactInformationFormData } from "@/lib/schemas";
import React, { useRef, useState } from "react";
import PreviewCard from "./PreviewCard";
import { CardModal } from "./PreviewModal";
import { Form } from "@/components/ui/form";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { useRouter } from "next/navigation";
import useSubmissions from "@/hooks/useSubmissions";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import { useAppSelector } from "@/state/redux";

const availableTemplates = [
  { id: 1, name: "Template 1" },
  { id: 2, name: "Template 2" },
  { id: 3, name: "Template 3" },
  { id: 4, name: "Template 4" },
  { id: 5, name: "Template 5" }
];

interface ContactInformationFormProps {
  existingSubmission?: any;
}

const ContactInformationForm = ({ existingSubmission }: ContactInformationFormProps) => {
  const router = useRouter();
  const { isSaving, saveSubmission } = useSubmissions();
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const { activeSession } = useAppSelector((state) => state.global);
  const dialogButtonRef = useRef<HTMLButtonElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [activePreview, setActivePreview] = useState(1);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const handlePreview = (card: number) => {
    setActivePreview(card);
    setOpenPreview(true);
  };

  const formatSelectedTemplates = (templates?: string[]) => {
    if (!templates || templates.length === 0) {
      return [];
    }
    let newTemplates = [];
    for (let i = 0; i < availableTemplates.length; i++) {
      const templateId = availableTemplates[i].id.toString();
      if (templates.includes(templateId)) {
        newTemplates.push(templateId);
      } else {
        newTemplates.push("");
      }
    }
    return newTemplates;
  };

  const defaultData: ContactInformationFormData = {
    name: existingSubmission?.name || "",
    email: existingSubmission?.email || "",
    airlinePreference: existingSubmission?.airlinePreference || "",
    position: existingSubmission?.position,
    selectedTemplates: formatSelectedTemplates(existingSubmission?.selectedTemplates),
  };

  const methods: UseFormReturn<ContactInformationFormData> = useForm<ContactInformationFormData>({
    resolver: zodResolver(ContactInformationSchema),
    defaultValues: defaultData,
  });

  const { setValue, handleSubmit, watch } = methods;

  const handleTemplateChange = (index: number, templateId: string) => {
    const selectedTemplates = watch("selectedTemplates") || [];
    let updatedSelectedTemplates = selectedTemplates;
    if (selectedTemplates.includes(templateId)) {
      updatedSelectedTemplates = selectedTemplates.filter((t) => t !== templateId && !!t);
      setValue("selectedTemplates", updatedSelectedTemplates);
    } else {
      updatedSelectedTemplates = selectedTemplates.concat(templateId).filter((t) => !!t);
      setValue("selectedTemplates", updatedSelectedTemplates);
    }
  };

  const sendEmailNotifications = async (submissionData: ContactInformationFormData) => {
    try {
      setIsEmailSending(true);
      
      const selectedTemplatesList = submissionData.selectedTemplates?.filter(t => t) || [];
      
      const emailResponse = await fetch('/api/email/send-resume-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pilotName: submissionData.name,
          pilotEmail: submissionData.email,
          airline: submissionData.airlinePreference,
          position: submissionData.position,
          selectedTemplates: selectedTemplatesList,
        }),
      });

      const result = await emailResponse.json();

      if (result.success) {
        toast.success('Resume submitted successfully! You will receive a confirmation email shortly.');
      } else {
        console.warn('Email notification failed:', result.error || 'Unknown error');
        toast.success('Resume submitted successfully! (Email notifications may be delayed)');
      }

    } catch (error) {
      console.error('Error sending email notifications:', error);
      toast.success('Resume submitted successfully! (Email notifications may be delayed)');
    } finally {
      setIsEmailSending(false);
    }
  };

  const onSubmit = async (data: ContactInformationFormData) => {
    const sessionId = activeSession || localStorage.getItem("activeSession");
    
    if (!sessionId) {
      toast.error("No resume session found. Please start by filling out your personal information.");
      router.push("/resume?step=1");
      return;
    }

    console.log("📋 Submitting contact information:", data);
    console.log("🆔 Using session ID:", sessionId);

    const saveData: ContactInformationFormData = {
      name: data.name || "",
      email: data.email || "",
      airlinePreference: data.airlinePreference || "",
      position: data.position === "Other" ? data.otherPosition || "" : data.position || "",
      selectedTemplates: data.selectedTemplates || availableTemplates.map((template) => template.id.toString()),
    };

    try {
      await saveSubmission({
        resumeId: sessionId,
        ...saveData,
      });

      await sendEmailNotifications(saveData);

      router.push("/submissions");

    } catch (error: any) {
      console.error("Error saving submission:", error);
      
      if (error?.data?.error) {
        toast.error("Failed to submit: " + error.data.error);
      } else if (error?.message) {
        toast.error("Failed to submit: " + error.message);
      } else {
        toast.error("Failed to submit resume. Please try again.");
      }
    }
  };

  const isProcessing = isSaving || isEmailSending;

  return (
    <div className="w-full h-full">
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-details__form flex flex-col gap-5 w-2/3">
          <div className="flex flex-col gap-1 w-full pt-5">
            <span className="text-black font-bold">Full Name</span>
            <CustomFormField
              name={"name"}
              placeholder="Enter Your Name"
              type="text"
              label=""
              className="w-64 rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-black font-bold">What email would you like to receive the resume?</span>
            <CustomFormField
              name={"email"}
              placeholder="Enter Email Address"
              type="text"
              label=""
              className="w-64 rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-black font-bold">Which airline are you applying to work at?</span>
            <CustomFormField
              name={"airlinePreference"}
              placeholder="Enter Airline Name"
              type="text"
              label=""
              className="w-64 rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-black font-bold">What position are you applying for?</span>
            <CustomFormField
              name={"position"}
              placeholder="Select Position"
              type="select"
              options={[
                { value: "Captain", label: "Captain" },
                { value: "First Officer", label: "First Officer" },
                { value: "Relief Pilot", label: "Relief Pilot" },
                { value: "Instructor Pilot", label: "Instructor Pilot" },
                { value: "Check Airman", label: "Check Airman" },
                { value: "Designated Pilot Examiner", label: "Designated Pilot Examiner" },
                { value: "Aircraft Commander", label: "Aircraft Commander" },
                { value: "Co-Pilot", label: "Co-Pilot" },
                { value: "Mission/Systems Operator", label: "Mission/Systems Operator" },
                { value: "Flight Lead", label: "Flight Lead" },
                { value: "Wingman", label: "Wingman" },
                { value: "Evaluator Pilot", label: "Evaluator Pilot" },
                { value: "Other", label: "Other" }
              ]}
              label=""
              className="w-64 rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
            />
            {methods.watch("position") === "Other" && (
              <CustomFormField
                name={"otherPosition"}
                placeholder="Enter Other Position"
                type="text"
                label=""
                className="w-64 rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
              />
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <span className="text-black font-bold">Please select the templates you prefer</span>
            {availableTemplates.map((template, index) => {
              const selectedTemplates = watch("selectedTemplates") || [];
              const isChecked = selectedTemplates.includes(template.id.toString());
              return (
                <CustomFormField
                  key={index}
                  name={`selectedTemplates.${index}`}
                  className="py-3 text-black rounded-none p-2"
                  label=""
                  labelElement={
                    <PreviewCard handlePreview={handlePreview} card={template.id} handleGenerateResume={() => {}} />
                  }
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTemplateChange(index, template.id.toString())}
                  labelClassName="font-normal text-black"
                  inputClassName="text-black rounded-none"
                />
              )
            })}
          </div>
        </form>
      </Form>
      
      <CardModal
        card={openPreview}
        isOpen={openPreview}
        setIsOpen={setOpenPreview}
        dialogButtonRef={dialogButtonRef}
        activePreview={activePreview}
        handleGenerateResume={() => {}}
      />
      
      <div className="pt-10 pb-10 flex w-full justify-between">
        <Button
          type="button"
          onClick={() => navigateToStep(navigationStep - 1)}
          className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold mb-4 md:mb-0"
        >
          Previous
        </Button>
        
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loading />
            <span className="text-sm text-gray-600">
              {isSaving ? 'Saving submission...' : isEmailSending ? 'Sending notifications...' : 'Processing...'}
            </span>
          </div>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="w-fit min-w-32 px-4 py-2 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow-md text-sm font-semibold mb-4 md:mb-0"
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactInformationForm;
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ProfessionalExperienceFormData, ProfessionalExperienceSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { formatDate, updateWizardStep } from "@/lib/utils";
import { setFormData } from "@/state";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { Trash, Edit } from "lucide-react";
import useResume from "@/hooks/useResume";
import { useGetUserQuery, useGenerateJobDescriptionMutation } from "@/state/api";
import { MembershipLevel } from "@/lib/getUser";

const ProfessionalExperience = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const { data: userData, isLoading: userDataLoading } = useGetUserQuery();
  const [generateJobDescription, { data: generatedDescription, isLoading: generatingDescription }] = useGenerateJobDescriptionMutation();
  const [experienceData, setExperienceData] = useState<ProfessionalExperienceFormData[]>([]);
  const [activePage, setActivePage] = useState<"Form" | "Summary">("Form");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();

  const defaultValues = {
    company: "",
    job_title: "",
    aircraft: "",
    job_location: "",
    date_from: null,
    date_to: null,
    keyrole: "",
    keyrole_original: "",
    keyrole_generated: "",
    highlight_roles_exp: "",
    currently_employed: false, // Add this
  };

  const methods = useForm<ProfessionalExperienceFormData>({
    resolver: zodResolver(ProfessionalExperienceSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      if (data && data.length > 0) {
        const convertedData = data.map((item: any) => ({
          ...item,
          date_from: item.date_from ? new Date(item.date_from) : null,
          date_to: item.date_to ? new Date(item.date_to) : null,
          currently_employed: item.currently_employed || false, // Add this
        }));
        setExperienceData(convertedData);
        setActivePage("Summary");
      }
    }
  }, [formData, navigationStep]);

  const isAdminUser = useMemo(() => {
    if (!userData?.success) {
      return false;
    }
    if (userData && userData.user.level === MembershipLevel.Admin) {
      return true;
    }
    return false;
  }, [userData]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const experience = experienceData[index];
    const convertedExperience = {
      ...experience,
      date_from: experience.date_from ? new Date(experience.date_from) : null,
      date_to: experience.date_to ? new Date(experience.date_to) : null,
      currently_employed: experience.currently_employed || false, // Add this
    };
    methods.reset(convertedExperience);
    setActivePage("Form");
  };

  const handleDelete = (index: number) => {
    const updatedData = experienceData.filter((_, i) => i !== index);
    setExperienceData(updatedData);
    const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
    dispatch(setFormData(savedData));
    saveResumeData(savedData);
  };

  const canGenerateDescription = useMemo(() => {
    const keyRole = methods.getValues().keyrole;
    const validInput = keyRole && keyRole.trim().length > 0;
    if (
      isAdminUser &&
      validInput
    ) {
      return true;
    }
    return false;
  }, [isAdminUser, methods.watch("keyrole")]);

  const hasGeneratedDescription = useMemo(() => {
    const generatedDescriptionFormValue = methods.getValues("keyrole_generated");
    return (generatedDescription && generatedDescription.success && generatedDescription.description) || generatedDescriptionFormValue?.length;
  }, [generatedDescription, methods.getValues("keyrole_generated")]);

  const hasReplacedDescription = useMemo(() => {
    return hasGeneratedDescription && methods.getValues("keyrole_original") !== methods.getValues("keyrole");
  }, [hasGeneratedDescription, methods.getValues("keyrole_original"), methods.getValues("keyrole")]);

  const handleUndoReplaceDescription = () => {
    methods.setValue("keyrole", methods.getValues("keyrole_original"));
  };

  const handleReplaceDescription = () => {
    methods.setValue("keyrole", methods.getValues("keyrole_generated"));
  };

  const handleGenerateJobDescription = async () => {
    if (!canGenerateDescription) {
      return;
    }
    const inputData = methods.getValues();
    const description = inputData?.keyrole ?? "";
    const company = inputData?.company ?? undefined;
    const title = inputData?.job_title ?? undefined;
    const aircraft = inputData?.aircraft ?? undefined;
    const response = await generateJobDescription({
      description,
      company,
      title,
      aircraft,
    });
    if (response?.data && response.data.success && response.data.description) {
      methods.setValue("keyrole_original", description);
      methods.setValue("keyrole_generated", response.data.description);
    }
  };

  return activePage === "Form" ? (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Professional Experience</h1>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data) => {
            let modifiedData: ProfessionalExperienceFormData[];
            if (editIndex !== null) {
              modifiedData = [...experienceData];
              modifiedData[editIndex] = data;
              setEditIndex(null);
            } else {
              modifiedData = [...experienceData, data];
            }
            if (JSON.stringify(data) === JSON.stringify(defaultValues)) {
              modifiedData = [];
              if (experienceData.length > 0) {
                modifiedData = experienceData;
              }
            }
            setExperienceData(modifiedData);
            const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
            dispatch(setFormData(savedData));
            setActivePage("Summary");
            saveResumeData(savedData);  
          })}
          className="checkout-details__form flex flex-col gap-5"
        >
          <span className="text-black font-semibold pt-5">List your recent aviation jobs</span>
          <div className="flex items-center gap-4">
            <CustomFormField
              name="company"
              label="Company/Squadron"
              type="text"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Company/Squadron"
            />
            <CustomFormField
              name="job_title"
              label="Job Title"
              type="text"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Enter Job Title Here"
            />
            <CustomFormField
              name="aircraft"
              label="Aircraft Operated"
              type="text"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Enter Aircraft Operated Here"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-row gap-5">
              <CustomFormField
                name="date_from"
                label="Start Date"
                type="date"
                placeholder="Select a date range"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
              <div className="flex flex-col gap-2 relative">
                <div className="flex items-center space-x-2 absolute bottom-[-25px]">
                  <input
                    type="checkbox"
                    id="currentlyEmployed"
                    {...methods.register("currently_employed")}
                    onChange={(e) => {
                      methods.setValue("currently_employed", e.target.checked);
                      if (e.target.checked) {
                        methods.setValue("date_to", null);
                      }
                    }}
                    className="text-black"
                  />
                  <Label htmlFor="currentlyEmployed" className="text-black">
                    Currently Employed
                  </Label>
                </div>
                <CustomFormField
                  name="date_to"
                  label="End Date"
                  type="date"
                  placeholder="Select a date range"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black rounded-none p-2"
                  disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
                  disabled={methods.watch("currently_employed")}
                />
              </div>
            </div>
            <CustomFormField
              name="job_location"
              label="City/State"
              type="text"
              className="w-1/3 rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Job City/State"
            />
          </div>
          <div className="flex items-center flex-wrap">
            <CustomFormField
              name="keyrole"
              label="Describe your key responsibilities and accomplishments for each role"
              type="textarea"
              className={`${isAdminUser ? "w-1/2" : "w-full"} rounded mt-4 pr-4`}
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Job Roles"
            />
            {isAdminUser && (
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    className="w-fit min-w-32 px-3 py-3 bg-white-100 hover:bg-orange-500 hover:text-white-100 text-orange-500 border border-orange-500 rounded-full text-sm font-semibold"
                    onClick={handleGenerateJobDescription}
                    disabled={!canGenerateDescription || resumeSaving || generatingDescription}
                  >
                    {hasGeneratedDescription ? "Regenerate" : "Generate Description"}
                  </Button>
                  {hasGeneratedDescription && (
                    <Button
                      type="button"
                      className="w-fit min-w-32 px-3 py-3 bg-black hover:bg-orange-500 text-white-100 rounded-full text-sm font-semibold"
                      onClick={hasReplacedDescription ? handleUndoReplaceDescription : handleReplaceDescription}
                      disabled={!canGenerateDescription || resumeSaving || generatingDescription}
                    >
                      {hasReplacedDescription ? "Undo" : "Replace Description"}
                    </Button>
                  )}
                </div>
                <CustomFormField
                  name="keyrole_generated"
                  label=""
                  type="textarea"
                  className="w-full rounded"
                  labelClassName="display-none"
                  inputClassName="py-3 text-black rounded-none p-2"
                  placeholder="Generated Job Description"
                  disabled={true}
                />
              </div>
            )}
            {isAdminUser && (
              <div className="w-1/2 flex flex-col">
                <Label className="text-black font-normal mt-4">
                  Original Job Description
                </Label>
                <CustomFormField
                  name="keyrole_original"
                  label=""
                  type="textarea"
                  className="flex rounded pr-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black rounded-none p-2"
                  placeholder=""
                  disabled={true}
                />
              </div>
            )}
          </div>
          <CustomFormField
            name="highlight_roles_exp"
            label="Highlight leadership roles or experiences (e.g., mentoring, team lead, project management)"
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Roles or Experiences"
          />
          <div className="pt-10 w-full flex justify-between">
            <Button
              type="button"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
              onClick={() => navigateToStep(navigationStep - 1)}
            >
              Previous
            </Button>
            <Button
              type="submit"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            >
              {editIndex !== null ? "Update Experience" : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  ) : (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Professional Experience</h1>
      <div className="flex flex-col gap-5 pt-5">
        {experienceData && experienceData.length > 0 ? (
          experienceData.map((form, index) => (
            <div className="w-2/3 border-black border rounded-lg bg-white-100" key={index}>
              <div className="flex justify-between">
                <div className="py-2 px-4 font-bold text-lg border-r border-b border-black text-black rounded-br-lg">
                  {index + 1}
                </div>
                <div className="flex gap-4 px-4">
                  <button className="p-2 rounded-full hover:bg-gray-50" onClick={() => handleEdit(index)}>
                    <Edit color="black" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-50" onClick={() => handleDelete(index)}>
                    <Trash color="black" className="hover:text-red-500" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 px-10 py-5 text-black">
                <p>
                  <strong>
                    {form.job_title} {form.company}
                  </strong>
                </p>
                <p>
                  <strong>
                    {form.job_location}
                    {form.date_from ? ` (${formatDate(form.date_from)}` : ""}
                    {form.currently_employed ? " - Present)" : form.date_to ? ` - ${formatDate(form.date_to)})` : ")"}
                  </strong>
                </p>
              </div>
            </div>
          ))
        ) : (
          <span className="text-black pt-5">No Entry Added</span>
        )}
      </div>
      {experienceData.length < 4 && (
        <div className="pt-10 w-full flex items-center justify-center">
          <Button
            className="w-fit min-w-32 px-3 my-6 py-3 border bg-white-100 border-orange-500 hover:bg-orange-300 text-orange-500 rounded-full shadow text-sm font-semibold"
            type="button"
            onClick={() => {
              setActivePage("Form");
              methods.reset(defaultValues);
            }}
          >
            Add More Professional Experience
          </Button>
        </div>
      )}
      <div className="pt-10 w-full flex justify-between">
        <Button
          type="button"
          className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
          onClick={() => navigateToStep(navigationStep - 1)}
        >
          Previous
        </Button>
        <Button
          className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
          type="button"
          onClick={() => navigateToStep(navigationStep + 1)}
        >
          Continue to Professional Development
        </Button>
      </div>
    </div>
  );
};

export default ProfessionalExperience;
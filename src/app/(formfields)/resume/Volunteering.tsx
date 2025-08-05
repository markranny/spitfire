"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { VolunteeringSchema, VolunteeringFormData } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { formatDate, updateWizardStep } from "@/lib/utils";
import { setFormData } from "@/state";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { Trash, Edit } from "lucide-react";
import { motion } from "framer-motion";
import useResume from "@/hooks/useResume";
import { MembershipLevel } from "@/lib/getUser";
import { useGenerateVolunteeringResponsibilitiesMutation, useGenerateVolunteeringRoleMutation, useGetUserQuery } from "@/state/api";

// Assuming your schema looks something like this (for reference):
// VolunteeringSchema: z.object({
//   has_volunteer_role: z.boolean(),
//   volunteer_list: z.array(
//     z.object({
//       organization: z.string().min(1).optional(),
//       volunteer_type: z.string().optional(),
//       role: z.string().min(1).optional(),
//       responsibilities: z.string().min(1).optional(),
//       date_from: z.date().nullable().optional(),
//       date_to: z.date().nullable().optional(),
//     })
//   ).optional(),
// });

const Volunteering = () => {
  const defaultValues: VolunteeringFormData = {
    has_volunteer_role: false,
    volunteer_list: [
      {
        organization: "",
        volunteer_type: "",
        role: "",
        role_original: "",
        role_generated: "",
        responsibilities: "",
        responsibilities_original: "",
        responsibilities_generated: "",
        date_from: null,
        date_to: null,
        currently_volunteering: false, // Add this
      },
    ],
  };
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();
  const { data: userData, isLoading: userDataLoading } = useGetUserQuery();
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const [generateVolunteeringResponsibilities, { data: generatedResponsibilities, isLoading: generatingResponsibilities }] =
    useGenerateVolunteeringResponsibilitiesMutation();
  const [volunteeringData, setVolunteeringData] = useState<VolunteeringFormData>({
    has_volunteer_role: false,
    volunteer_list: [],
  });
  const [activePage, setActivePage] = useState<"Form" | "Summary">("Form");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isAddingFromSummary, setIsAddingFromSummary] = useState(false);
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);

  const isAdminUser = useMemo(() => {
    if (!userData?.success) {
      return false;
    }
    if (userData && userData.user.level === MembershipLevel.Admin) {
      return true;
    }
    return false;
  }, [userData]);

  const methods = useForm<VolunteeringFormData>({
    resolver: zodResolver(VolunteeringSchema),
    defaultValues,
  });

  const {
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      if (data && data.has_volunteer_role !== undefined) {
        const convertedData = {
          ...data,
          volunteer_list:
            data.volunteer_list?.map((item: any) => ({
              ...item,
              date_from: item.date_from ? new Date(item.date_from) : null,
              date_to: item.date_to ? new Date(item.date_to) : null,
              currently_volunteering: item.currently_volunteering || false, // Add this
            })) || [],
        };
        setVolunteeringData(convertedData);
        methods.reset(convertedData);
        setActivePage(convertedData.volunteer_list && convertedData.volunteer_list.length > 0 ? "Summary" : "Form");
      }
    }
  }, [formData, navigationStep, methods]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const volunteerData = volunteeringData.volunteer_list![index];
    const convertedVolunteerData = {
      ...volunteerData,
      date_from: volunteerData.date_from ? new Date(volunteerData.date_from) : null,
      date_to: volunteerData.date_to ? new Date(volunteerData.date_to) : null,
      currently_volunteering: volunteerData.currently_volunteering || false, // Add this
    };
    methods.reset({
      has_volunteer_role: true,
      volunteer_list: [convertedVolunteerData],
    });
    setIsAddingFromSummary(true);
    setActivePage("Form");
  };

  const handleDelete = (index: number) => {
    const updatedList = volunteeringData.volunteer_list!.filter((_, i) => i !== index);
    const updatedData = {
      ...volunteeringData,
      volunteer_list: updatedList,
    };
    setVolunteeringData(updatedData);
    const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
    dispatch(setFormData(savedData));
    if (updatedList.length === 0) {
      setActivePage("Form");
    }
    saveResumeData(savedData);
  };

  const isVolunteerEntryEmpty = (volunteer: any) => {
    return (
      (!volunteer.organization || volunteer.organization.trim() === "") &&
      (!volunteer.volunteer_type || volunteer.volunteer_type.trim() === "") &&
      (!volunteer.role || volunteer.role.trim() === "") &&
      (!volunteer.responsibilities || volunteer.responsibilities.trim() === "") &&
      !volunteer.date_from &&
      !volunteer.date_to
    );
  };

  const onSubmit = methods.handleSubmit((data) => {
    let updatedData: VolunteeringFormData;

    if (!data.has_volunteer_role && !isAddingFromSummary) {
      updatedData = {
        has_volunteer_role: false,
        volunteer_list: [],
      };
      setVolunteeringData(updatedData);
      const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
      dispatch(setFormData(savedData));
      navigateToStep(navigationStep + 1);
      saveResumeData(savedData);
    } else {
      const nonEmptyVolunteers = (data.volunteer_list || []).filter((volunteer) => !isVolunteerEntryEmpty(volunteer));

      if (nonEmptyVolunteers.length === 0) {
        updatedData = {
          has_volunteer_role: volunteeringData.has_volunteer_role,
          volunteer_list: volunteeringData.volunteer_list || [],
        };
        setVolunteeringData(updatedData);
        const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
        dispatch(setFormData(savedData));
        navigateToStep(navigationStep + 1);
        saveResumeData(savedData);
      } else {
        if (editIndex !== null) {
          const updatedList = [...(volunteeringData.volunteer_list || [])];
          updatedList[editIndex] = { ...nonEmptyVolunteers[0] }; // Use the edited entry
          updatedData = {
            has_volunteer_role: true,
            volunteer_list: updatedList,
          };
          setEditIndex(null);
        } else {
          updatedData = {
            has_volunteer_role: true,
            volunteer_list: [...(volunteeringData.volunteer_list || []), ...nonEmptyVolunteers],
          };
        }
        setVolunteeringData(updatedData);
        const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
        dispatch(setFormData(savedData));
        setActivePage("Summary");
        saveResumeData(savedData);
      }
    }
    setIsAddingFromSummary(false);
    methods.reset(defaultValues);
  });

  const handleAddNew = () => {
    methods.reset({
      has_volunteer_role: true,
      volunteer_list: [
        {
          organization: "",
          volunteer_type: "",
          role: "",
          responsibilities: "",
          date_from: null,
          date_to: null,
        },
      ],
    });
    setIsAddingFromSummary(true);
    setActivePage("Form");
  };

  const canGenerateRole = useMemo(() => {
    const role = methods.getValues().volunteer_list?.[0]?.role;
    const validInput = role && role.trim().length > 0;
    if (
      isAdminUser &&
      validInput
    ) {
      return true;
    }
    return false;
  }, [isAdminUser, methods.watch(`volunteer_list.0.role`), editIndex]);

  const canGenerateResponsibilities = useMemo(() => {
    const responsibilities = methods.getValues().volunteer_list?.[0]?.responsibilities;
    const validInput = responsibilities && responsibilities.trim().length > 0;
    if (
      isAdminUser &&
      validInput
    ) {
      return true;
    }
    return false;
  }, [isAdminUser, methods.watch(`volunteer_list.0.responsibilities`), editIndex]);

  const hasGeneratedResponsibilities = useMemo(() => {
    const generatedResponsibilitiesFormValue = methods.getValues(`volunteer_list.0.responsibilities_generated`);
    return (generatedResponsibilities && generatedResponsibilities.success && generatedResponsibilities.responsibilities) || generatedResponsibilitiesFormValue?.length;
  }, [generatedResponsibilities, methods.watch(`volunteer_list.0.responsibilities_generated`)]);

  const hasReplacedResponsibilities = useMemo(() => {
    return hasGeneratedResponsibilities && methods.getValues("volunteer_list.0.responsibilities_original") !== methods.getValues("volunteer_list.0.responsibilities");
  }, [hasGeneratedResponsibilities, methods.getValues("volunteer_list.0.responsibilities_original"), methods.getValues("volunteer_list.0.responsibilities")]);

  const handleUndoReplaceResponsibilities = () => {
    methods.setValue("volunteer_list.0.responsibilities", methods.getValues("volunteer_list.0.responsibilities_original"));
  };

  const handleReplaceResponsibilities = () => {
    methods.setValue("volunteer_list.0.responsibilities", methods.getValues("volunteer_list.0.responsibilities_generated"));
  };

  const handleGenerateResponsibilities = async () => {
    if (!canGenerateResponsibilities) {
      return;
    }
    const inputData = methods.getValues();
    const responsibilities = inputData?.volunteer_list?.[0]?.responsibilities ?? "";
    const organization = inputData?.volunteer_list?.[0]?.organization ?? undefined;
    const volunteer_type = inputData?.volunteer_list?.[0]?.volunteer_type ?? undefined;
    const response = await generateVolunteeringResponsibilities({
      responsibilities,
      organization,
      volunteer_type,
    });
    if (response?.data && response.data.success && response.data.responsibilities) {
      methods.setValue("volunteer_list.0.responsibilities_original", responsibilities);
      methods.setValue("volunteer_list.0.responsibilities_generated", response.data.responsibilities);
    }
  };

  if (activePage === "Form") {
    const volunteerIndex = editIndex !== null ? 0 : 0; // Always 0 since we reset with a single entry

    return (
      <div className="w-full h-full pl-12 py-12 pr-24">
        <h1 className="text-2xl font-semibold text-black">Volunteer and Leadership Activities</h1>
        <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
        <Form {...methods}>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="w-2/3">
              {!isAddingFromSummary && (
                <div className="pt-5">
                  <span className="text-black font-semibold">
                    Have you participated in volunteer work? If so, provide details on roles, responsibilities, and
                    dates.
                  </span>
                  <div className="w-2/3 py-2">
                    <RadioGroup
                      value={methods.watch("has_volunteer_role") ? "yes" : "no"}
                      onValueChange={(value: "yes" | "no") => {
                        methods.setValue("has_volunteer_role", value === "yes");
                      }}
                      className="pt-2 grid-flow-col"
                      orientation="horizontal"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="yes" className="text-black" />
                        <Label htmlFor="yes" className="text-black">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" className="text-black" />
                        <Label htmlFor="no" className="text-black">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {(methods.watch("has_volunteer_role") || isAddingFromSummary) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-8"
                >
                  <div className="pt-4 rounded-lg">
                    <CustomFormField
                      name={`volunteer_list.${volunteerIndex}.organization`}
                      label="What organization did you volunteer at?"
                      type="text"
                      className="w-full rounded mt-4"
                      labelClassName="font-normal text-black"
                      inputClassName="py-3 text-black rounded-none p-2"
                      placeholder="Enter Organization Here"
                    />
                    <div className="py-8 flex flex-col gap-4">
                      <Label className="font-normal text-black">What type organization did you volunteer at?</Label>
                      <RadioGroup
                        value={methods.watch(`volunteer_list.${volunteerIndex}.volunteer_type`)}
                        onValueChange={(value) =>
                          methods.setValue(`volunteer_list.${volunteerIndex}.volunteer_type`, value)
                        }
                        className="pt-2 flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Aviation" id="aviation" className="text-black" />
                          <Label htmlFor="aviation" className="text-black">
                            Aviation
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Non-Aviation" id="non-aviation" className="text-black" />
                          <Label htmlFor="non-aviation" className="text-black">
                            Non-Aviation
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Mentorship" id="mentorship" className="text-black" />
                          <Label htmlFor="mentorship" className="text-black">
                            Mentorship
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <span className="text-black pt-4">Dates</span>
                    <div className="flex flex-row gap-4 w-full items-center">
                      <CustomFormField
                        name={`volunteer_list.${volunteerIndex}.date_from`}
                        label="From Date"
                        type="date"
                        placeholder="Select a date"
                        className="w-full rounded mt-4"
                        labelClassName="font-normal text-black"
                        inputClassName="py-3 text-black w-full rounded-none p-2"
                        disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
                      />
                      <div className="w-full relative">
                        <div className="flex items-center space-x-2 pb-2 absolute bottom-[-25px]">
                          <input
                            type="checkbox"
                            id={`currentlyVolunteering-${volunteerIndex}`}
                            {...methods.register(`volunteer_list.${volunteerIndex}.currently_volunteering`)}
                            onChange={(e) => {
                              methods.setValue(
                                `volunteer_list.${volunteerIndex}.currently_volunteering`,
                                e.target.checked
                              );
                              if (e.target.checked) {
                                methods.setValue(`volunteer_list.${volunteerIndex}.date_to`, null);
                              }
                            }}
                            className="text-black"
                          />
                          <Label htmlFor={`currentlyVolunteering-${volunteerIndex}`} className="text-black">
                            Currently Volunteering
                          </Label>
                        </div>
                        <CustomFormField
                          name={`volunteer_list.${volunteerIndex}.date_to`}
                          label="To Date"
                          type="date"
                          placeholder="Select a date"
                          className="w-full rounded mt-4"
                          labelClassName="font-normal text-black"
                          inputClassName="py-3 text-black w-full rounded-none p-2"
                          disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
                          disabled={methods.watch(`volunteer_list.${volunteerIndex}.currently_volunteering`)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap">
                      <CustomFormField
                        name={`volunteer_list.${volunteerIndex}.role`}
                        label="Role"
                        type="text"
                        className="w-full rounded pr-4 mt-4"
                        labelClassName="font-normal text-black"
                        inputClassName="py-3 text-black rounded-none p-2"
                        placeholder="Provide Details Here"
                      />
                    </div>
                    <div className={`flex items-center flex-wrap ${isAdminUser ? "mt-4" : ""}`}>
                      <CustomFormField
                        name={`volunteer_list.${volunteerIndex}.responsibilities`}
                        label="Responsibilities"
                        type="textarea"
                        className={`${isAdminUser ? "w-1/2" : "w-full"} rounded pr-4 mt-4`}
                        labelClassName="font-normal text-black"
                        inputClassName="py-3 text-black rounded-none p-2"
                        placeholder="Provide Details Here"
                      />
                      {isAdminUser && (
                        <div className="w-1/2 flex flex-col">
                          <div className="flex items-center justify-between">
                            <Button
                              type="button"
                              className="w-fit min-w-32 px-3 py-3 bg-white-100 hover:bg-orange-500 hover:text-white-100 text-orange-500 border border-orange-500 rounded-full text-sm font-semibold"
                              onClick={handleGenerateResponsibilities}
                              disabled={!canGenerateResponsibilities || resumeSaving || generatingResponsibilities}
                            >
                              {hasGeneratedResponsibilities ? "Regenerate" : "Generate Responsibilities"}
                            </Button>
                            {hasGeneratedResponsibilities && (
                              <Button
                                type="button"
                                className="w-fit min-w-32 px-3 py-3 bg-black hover:bg-orange-500 text-white-100 rounded-full text-sm font-semibold"
                                onClick={hasReplacedResponsibilities ? handleUndoReplaceResponsibilities : handleReplaceResponsibilities}
                                disabled={!canGenerateResponsibilities || resumeSaving || generatingResponsibilities}
                              >
                                {hasReplacedResponsibilities ? "Undo" : "Replace Responsibilities"}
                              </Button>
                            )}
                          </div>
                          <CustomFormField
                            name={`volunteer_list.${volunteerIndex}.responsibilities_generated`}
                            label=""
                            type="textarea"
                            className="w-full rounded"
                            labelClassName="display-none"
                            inputClassName="py-3 text-black rounded-none p-2"
                            placeholder="Generated Responsibilities"
                            disabled={true}
                          />
                        </div>
                      )}
                      {isAdminUser && (
                        <div className="w-1/2 flex flex-col">
                          <Label className="text-black font-normal mt-4">
                            Original Responsibilities
                          </Label>
                          <CustomFormField
                            name={`volunteer_list.${volunteerIndex}.responsibilities_original`}
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
                  </div>
                </motion.div>
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
                  type="submit"
                  className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
                >
                  {editIndex !== null ? "Update" : "Continue"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Volunteer and Leadership Activities</h1>
      <div className="flex flex-col gap-5 pt-5">
        {volunteeringData.volunteer_list && volunteeringData.volunteer_list.length > 0 ? (
          volunteeringData.volunteer_list.map((form, index) => (
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
                  <strong>{form.role}</strong> <strong>{form.organization}</strong>
                </p>
                <p>
                  <strong>Duration:</strong>{" "}
                  {form.date_from
                    ? form.currently_volunteering
                      ? `${formatDate(new Date(form.date_from))} - Present`
                      : form.date_to
                      ? `${formatDate(new Date(form.date_from))} - ${formatDate(new Date(form.date_to))}`
                      : `${formatDate(new Date(form.date_from))} - Not specified`
                    : "Dates not specified"}
                </p>
                <p>
                  <strong>Type:</strong> {form.volunteer_type || "Not specified"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No volunteering data available</p>
        )}

        <div className="pt-10 w-full flex items-center justify-center">
          <Button
            className="w-fit min-w-32 px-3 my-6 py-3 border bg-white-100 border-orange-500 hover:bg-orange-300 text-orange-500 rounded-full shadow text-sm font-semibold"
            type="button"
            onClick={handleAddNew}
          >
            Add More Volunteering
          </Button>
        </div>

        <div className="pt-10 w-full flex justify-between">
          <Button
            type="button"
            className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            onClick={() => navigateToStep(navigationStep - 1)}
          >
            Previous
          </Button>
          <div className="flex gap-4">
            <Button
              type="button"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
              onClick={handleAddNew}
            >
              Add New
            </Button>
            <Button
              type="button"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
              onClick={() => navigateToStep(navigationStep + 1)}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteering;

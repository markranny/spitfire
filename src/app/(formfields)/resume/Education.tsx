"use client";
import React, { useEffect, useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { EducationFormData, EducationSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { formatDate, updateWizardStep } from "@/lib/utils";
import { setFormData } from "@/state";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { Trash, Edit } from "lucide-react";
import useResume from "@/hooks/useResume";

const Education = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const [educationData, setEducationData] = useState<EducationFormData[]>([]);
  const [activePage, setActivePage] = useState<"Form" | "Summary">("Form");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();
  const defaultValues: EducationFormData = {
    school_name: "",
    degree: "",
    concentration: "",
    minor_concentration: "",
    gpa: 0,
    honors: "",
    location: "",
    date_from: null,
    date_to: null,
  };

  const methods = useForm<EducationFormData>({
    resolver: zodResolver(EducationSchema),
    defaultValues: defaultValues,
  });

  const {
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      if (data && data.length > 0) {
        // Map over the data to transform string dates into a format compatible with the form
        const transformedData = data.map((item: EducationFormData) => ({
          ...item,
          date_from: item.date_from ? new Date(item.date_from) : null,
          date_to: item.date_to ? new Date(item.date_to) : null,
        }));
        setEducationData(transformedData);
        setActivePage("Summary");
      }
    }
  }, [formData, navigationStep]);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    methods.reset(educationData[index]);
    setActivePage("Form");
  };

  const handleDelete = (index: number) => {
    const updatedData = educationData.filter((_, i) => i !== index);
    setEducationData(updatedData);
    const savedData = updateWizardStep("formData", navigationStep, updatedData, true);
    dispatch(setFormData(savedData));
    saveResumeData(savedData);
  };

  return activePage === "Form" ? (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Education</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data) => {
            let modifiedData: EducationFormData[];
            if (editIndex !== null) {
              modifiedData = [...educationData];
              modifiedData[editIndex] = data;
              setEditIndex(null);
            } else {
              modifiedData = [...educationData, data];
            }
            if (JSON.stringify(data) === JSON.stringify(defaultValues)) {
              modifiedData = [];
              if (educationData.length > 0) {
                modifiedData = [...educationData];
              }
            }
            setEducationData(modifiedData);
            const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
            dispatch(setFormData(savedData));
            setActivePage("Summary");
            saveResumeData(savedData);
          })}
          className="checkout-details__form flex flex-col gap-5"
        >
          <div className="flex flex-col w-4/5 pt-5">
            <span className="text-black font-semibold">Where did you complete your education?</span>
            <div className="flex gap-4">
              <CustomFormField
                name="school_name"
                label="School Name"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter School Name"
              />
              <CustomFormField
                name="degree"
                label="Degree"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Degrees Obtained"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="concentration"
                label="Concentration"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Concentration"
              />
              <CustomFormField
                name="minor_concentration"
                label="Minor Concentration"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Minor Concentration"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="gpa"
                label="GPA"
                step="0.1"
                type="number"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter GPA"
              />
              <CustomFormField
                name="honors"
                label="Honors"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Honors Obtained"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="location"
                label="College City/State"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter College City"
              />
              <div className="flex flex-row gap-4 w-full items-center">
                <CustomFormField
                  name="date_from"
                  label="College Start Date  "
                  type="date"
                  placeholder="Select a date"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black w-full rounded-none p-2"
                  disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")} // Example restriction
                />
                <CustomFormField
                  name="date_to"
                  label="End Date"
                  type="date"
                  placeholder="Select a date"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black w-full rounded-none p-2"
                  disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")} // Example restriction
                />
              </div>
            </div>
          </div>

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
              {editIndex !== null ? "Update Education" : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  ) : (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Education</h1>
      <div className="flex flex-col gap-5 pt-5">
        {educationData && educationData.length > 0 ? (
          educationData.map((form, index) => (
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
                    {form.school_name} {form.degree}
                  </strong>
                </p>
                <p>
                  <strong>
                    {form.location} {formatDate(form.date_from || "")}{" "}
                    {form.date_to && `- ${formatDate(form.date_to || "")}`}
                  </strong>
                </p>
                <p>
                  <strong>Concentration: {form.concentration}</strong>
                </p>
                <p>
                  <strong>Minor: {form.minor_concentration}</strong>
                </p>
                <p>
                  <strong>GPA: {form.gpa}</strong>
                </p>
                <p>
                  <strong>Honors: {form.honors}</strong>
                </p>
              </div>
            </div>
          ))
        ) : (
          <span className="text-black pt-5">No Entry Added</span>
        )}
      </div>
      {educationData.length < 2 && (
        <div className="pt-10 w-full flex items-center justify-center">
          <Button
            className="w-fit min-w-32 px-3 my-6 py-3 border bg-white-100 border-orange-500 hover:bg-orange-300 text-orange-500 rounded-full shadow text-sm font-semibold"
            type="button"
            onClick={() => {
              setActivePage("Form");
              methods.reset(defaultValues);
            }}
          >
            Add More Education
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
          Continue to Volunteering
        </Button>
      </div>
    </div>
  );
};

export default Education;

"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  certificatesSchema,
  CertificatesFormData,
  SkillsAndQualificationsSchema,
  SkillsAndQualificationsFormData,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { setFormData } from "@/state";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";

const SkillsAndQualifications = () => {
  // is_multi_bilingual: boolean;
  // any_technical_soft_skills: boolean;
  // languange_1?: string;
  // proficiency_level_1?: string;
  // languange_2?: string;
  // proficiency_level_2?: string;
  // languange_3?: string;
  // proficiency_level_3?: string;
  // technical_soft_skills?: string;
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const defaultData = {
    any_technical_soft_skills: false,
    technical_soft_skills: "",
    is_multi_bilingual: false,
    languange_1: "",
    proficiency_level_1: "",
    languange_2: "",
    proficiency_level_2: "",
    languange_3: "",
    proficiency_level_3: "",
  };
  const methods = useForm<SkillsAndQualificationsFormData>({
    resolver: zodResolver(SkillsAndQualificationsSchema),
    defaultValues: defaultData,
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      methods.reset(data);
    }
  }, [methods, formData, navigationStep]);

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Skills and Qualifications</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data: any) => {
            let modifiedData = data;
            console.log(modifiedData, defaultData, JSON.stringify(modifiedData) == JSON.stringify(defaultData));
            console.log(JSON.stringify(modifiedData));
            console.log(JSON.stringify(defaultData));
            if (JSON.stringify(modifiedData) === JSON.stringify(defaultData)) {
              modifiedData = null;
            }
            const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
            dispatch(setFormData(savedData));
            navigateToStep(navigationStep + 1);
          })}
          className="checkout-details__form flex flex-col gap-5"
        >
          <div className="pt-5">
            <span className="text-black">
              Are you bilingual or multilingual? If so, list languages and proficiency levels.
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("is_multi_bilingual") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("is_multi_bilingual", value === "yes")}
                name="bilingual"
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
                  <RadioGroupItem className="text-black" value="no" id="no" />
                  <Label className="text-black" htmlFor="no">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-2/3">
            <div className="flex gap-4">
              <CustomFormField
                name="languange_1"
                label="Language"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Language"
              />
              <CustomFormField
                name="proficiency_level_1"
                label="Proficiency Level"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Proficiency Level"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="languange_2"
                label="Language"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Language"
              />
              <CustomFormField
                name="proficiency_level_2"
                label="Proficiency Level"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Proficiency Level"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="languange_3"
                label="Language"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Language"
              />
              <CustomFormField
                name="proficiency_level_3"
                label="Proficiency Level"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Proficiency Level"
              />
            </div>
          </div>
          <div className="pt-5">
            <span className="text-black">
              Do you have any technical or soft skills that would make you a strong candidate? (e.g., problem-solving,
              communication, adaptability)
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("any_technical_soft_skills") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("any_technical_soft_skills", value === "yes")}
                name="additionalSkills"
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
                  <RadioGroupItem className="text-black" value="no" id="no" />
                  <Label className="text-black" htmlFor="no">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <CustomFormField
            name="technical_soft_skills"
            label="Provide Details "
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Provide Details Here"
          />
          <div className="pt-10 w-full flex justify-between">
            <Button
              type="button"
              onClick={() => navigateToStep(navigationStep - 1)}
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            >
              Previous
            </Button>
            <Button
              type="submit"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
            >
              Continue to Emergency and Safety Procedures
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SkillsAndQualifications;

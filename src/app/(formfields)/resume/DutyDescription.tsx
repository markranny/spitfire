"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { DutyDescriptionFormData, DutyDescriptionSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { useAppSelector } from "@/state/redux";
import { useDispatch } from "react-redux";
import { setFormData } from "@/state";
import useResume from "@/hooks/useResume";

const DutyDescription = () => {
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();
  const defaultData = {
    primary_flight_responsibilities: "",
    manage_flight_planning_tasks: false,
    flight_planning_tasks: "",
    had_oversee_flight_inspections: false,
    oversee_flight_inspections: "",
    did_ensure_compliance: false,
    ensure_compliance_role: "",
    did_perform_op_duties: false,
    operational_duties: "",
  };
  const methods = useForm<DutyDescriptionFormData>({
    resolver: zodResolver(DutyDescriptionSchema),
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
      <h1 className="text-2xl font-semibold text-black">Duty Description/Flight Operations</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit((data: any) => {
            let modifiedData = data;
            if (JSON.stringify(modifiedData) === JSON.stringify(defaultData)) {
              modifiedData = null;
            }
            const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
            dispatch(setFormData(savedData));
            navigateToStep(navigationStep + 1);
            saveResumeData(savedData);
          })}
          className="checkout-details__form flex flex-col gap-5"
        >
          <CustomFormField
            name="primary_flight_responsibilities"
            label="What were your primary responsibilities during each flight operation?"
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Provide Details Here"
          />
          <div className="pt-5">
            <span className="text-black">
              Did you manage flight planning tasks, such as routing, fuel calculations, or weight and balance?
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("manage_flight_planning_tasks") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") =>
                  methods.setValue("manage_flight_planning_tasks", value === "yes")
                }
                name="managedFlightPlanning"
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
            name="flight_planning_tasks"
            label="If yes, provide details."
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Provide Details Here"
          />
          <div className="pt-5">
            <span className="text-black">Did you oversee or assist with pre-flight and post-flight inspections?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("had_oversee_flight_inspections") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") =>
                  methods.setValue("had_oversee_flight_inspections", value === "yes")
                }
                name="oversightInspections"
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
            name="oversee_flight_inspections"
            label="What specific tasks did this include?"
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Provide Details Here"
          />
          <div className="pt-5">
            <span className="text-black">
              Did you ensure compliance with FAA or international aviation regulations?
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("did_ensure_compliance") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("did_ensure_compliance", value === "yes")}
                name="ensureCompliance"
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
            name="ensure_compliance_role"
            label="If so, describe your role."
            type="textarea"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Provide Details Here"
          />
          <div className="pt-5">
            <span className="text-black">Did you perform operational duties under Part 91, 121, or 135?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("did_perform_op_duties") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("did_perform_op_duties", value === "yes")}
                name="performOperationalDuties"
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
            name="operational_duties"
            label="Specify which and your key responsibilities."
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
              Continue to Skills and Qualifications
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DutyDescription;

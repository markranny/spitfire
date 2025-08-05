"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { certificatesSchema, CertificatesFormData, LeadershipFormData, LeadershipSchema } from "@/lib/schemas";
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

const Leadership = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const defaultData = {
    did_mentor_pilots: false,
    mentor_approach: "",
    involve_in_crm: false,
    contribute_team_dynamic: "",
    manage_flight_crew: false,
    lead_strategies: "",
    work_as_check_airman: false,
    checkairman_instructor_responsibilities: "",
    handle_conflict: false,
    conflict_resolution: "",
  };
  const methods = useForm<LeadershipFormData>({
    resolver: zodResolver(LeadershipSchema),
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
      <h1 className="text-2xl font-semibold text-black">Leadership and Teamwork</h1>
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
          })}
          className="checkout-details__form flex flex-col gap-5"
        >
          <div className="pt-5">
            <span className="pt-5 text-black font-semibold">Did you mentor or train other pilots?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("did_mentor_pilots") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("did_mentor_pilots", value === "yes")}
                name="mentorOtherPilots"
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
            <CustomFormField
              name="mentor_approach"
              label="Describe your approach and results."
              type="textarea"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Provide Details Here"
            />
          </div>
          <div className="pt-5">
            <span className="pt-5 text-black font-semibold">Were you involved in crew resource management (CRM)?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("involve_in_crm") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("involve_in_crm", value === "yes")}
                name="involvedCRM"
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
            <CustomFormField
              name="contribute_team_dynamic"
              label="How did you contribute to the team dynamic?"
              type="textarea"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Provide Details Here"
            />
          </div>
          <div className="pt-5">
            <span className="pt-5 text-black font-semibold">Did you manage or lead flight crews?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("manage_flight_crew") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("manage_flight_crew", value === "yes")}
                name="leadCrews"
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
            <CustomFormField
              name="lead_strategies"
              label="If so, what strategies did you use to ensure effective collaboration?"
              type="textarea"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Provide Details Here"
            />
          </div>
          <div className="pt-5">
            <span className="pt-5 text-black font-semibold">
              Have you worked as a check airman, instructor, or examiner?
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("work_as_check_airman") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("work_as_check_airman", value === "yes")}
                name="workedCheckAirman"
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
            <CustomFormField
              name="checkairman_instructor_responsibilities"
              label="If yes, describe your role and responsibilities."
              type="textarea"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Provide Details Here"
            />
          </div>

          <div className="pt-5">
            <span className="pt-5 text-black font-semibold">
              Have you ever handled conflict resolution within the crew?
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("handle_conflict") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("handle_conflict", value === "yes")}
                name="workedCheckAirman"
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
            <CustomFormField
              name="conflict_resolution"
              label="Provide Examples."
              type="textarea"
              className="w-full rounded mt-4"
              labelClassName="font-normal text-black"
              inputClassName="py-3 text-black rounded-none p-2"
              placeholder="Provide Examples Here"
            />
          </div>
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
              Continue to Duty Description/Flight Operations
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Leadership;

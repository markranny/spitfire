"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  EmergencyAndSafetyFormData,
  EmergencyAndSafetySchema,
} from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { setFormData } from "@/state";
import { useAppSelector } from "@/state/redux";
import { useDispatch } from "react-redux";

const Emergency = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const defaultData = {
    respond_inflight_emergencies: false,
    inflight_emergencies: "",
  };
  const methods = useForm<EmergencyAndSafetyFormData>({
    resolver: zodResolver(EmergencyAndSafetySchema),
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
      <h1 className="text-2xl font-semibold text-black">Emergency and Safety Procedures</h1>
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
            <span className="text-black">Did you respond to in-flight emergencies?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("respond_inflight_emergencies") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") =>
                  methods.setValue("respond_inflight_emergencies", value === "yes")
                }
                name="respondToInFlightEmergencies"
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
            name="inflight_emergencies"
            label="If so, describe the situation and how you handled it. "
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

export default Emergency;

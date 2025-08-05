"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { FlightExperienceFormData, FlightExperienceSchema } from "@/lib/schemas";
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
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import useResume from "@/hooks/useResume";

const FlightExperience = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();

  const defaultOperatedAircrafts = {
    aircraft: "",
    flight_hours: undefined,
    privilege_type: "", // Changed to blank default
  };
  const defaultData = {
    military_sorties: 0,
    turbine: 0,
    pic_turbine: 0,
    total_flight_hours: 0,
    total_time: 0,
    total_pic_time: 0,
    total_sic_time: 0,
    multi_engine: 0,
    total_amel_asel_time: 0,
    total_instructor_time: 0,
    total_instrument_flight_time: 0,
    part_121_PIC_hours: 0,
    part_121_hours: 0,
    part_135_PIC_hours: 0,
    part_135_hours: 0,
    has_part_121_or_131: false,
    flown_list_regions_countries: "",
    has_major_flight_exp: false,
    major_flight_exp: "",
    has_commercial_privilege: false,
    commercial_privilege_exp: "",
    has_remote_pilot_exp: false,
    has_instructor_exp: false,
    night_flight_hours: 0,
    aircraft_operated_list: [defaultOperatedAircrafts, defaultOperatedAircrafts, defaultOperatedAircrafts],
  };

  const methods = useForm<FlightExperienceFormData>({
    resolver: zodResolver(FlightExperienceSchema),
    defaultValues: defaultData,
  });
  const { control, watch, setValue } = methods;
  const {
    fields: operatedAircraftFields,
    append: appendOperatedAircraft,
    remove: removeOperatedAircraft,
  } = useFieldArray({
    control: methods.control,
    name: "aircraft_operated_list",
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      methods.reset(data);
    }
  }, [methods, formData, navigationStep]);

  const handlePrivilegeChange = (index: number, type: "PIC" | "SIC" | "") => {
    const currentValue = watch(`aircraft_operated_list.${index}.privilege_type`);
    // If clicking the same value, clear it; otherwise set the new value
    setValue(`aircraft_operated_list.${index}.privilege_type`, currentValue === type ? "" : type);
  };

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Flight Experience</h1>
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
          className="checkout-details__form"
        >
          <div className="flex flex-col">
            <div className="flex gap-4 items-center">
              <CustomFormField
                name="total_flight_hours"
                label="Total Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="multi_engine"
                label="Multi Engine"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="total_amel_asel_time"
                label="Total AMEL/ASEL Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="total_instrument_flight_time"
                label="Total Instrument Flight Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="total_instructor_time"
                label="Total Instructor Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
            </div>
            <div className="flex gap-4 items-center">
              <CustomFormField
                name="total_pic_time"
                label="Total PIC Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="total_sic_time"
                label="Total SIC Time"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="turbine"
                label="Turbine"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="pic_turbine"
                label="PIC Turbine"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
              <CustomFormField
                name="night_flight_hours"
                label="Night Flight Hours"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none bg-transparent"
                placeholder="Enter Flight Hours"
              />
            </div>
            <div className="flex gap-4 items-center w-1/5 pr-4">
              <CustomFormField
                name="military_sorties"
                label="Military Sorties"
                type="number"
                step="0.1"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Time"
              />
            </div>
          </div>
          <div className="pt-5">
            <span className="text-black">
              Do you have Part 121 or Part 135 experience? Please provide hours for each.
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("has_part_121_or_131") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("has_part_121_or_131", value === "yes")}
                name="has_part_121_or_131"
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
          {methods.getValues("has_part_121_or_131") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ amount: 0.5, once: true }}
              className="flex flex-col"
            >
              <div className="flex flex-col w-3/5">
                <div className="flex gap-4 items-center">
                  <CustomFormField
                    name="part_121_hours"
                    label="121 Hours"
                    type="number"
                    step="0.1"
                    className="w-full rounded mt-4"
                    labelClassName="font-normal text-black"
                    inputClassName="py-3 text-black rounded-none"
                    placeholder="Enter Part 121 Hours"
                  />
                  <CustomFormField
                    name="part_121_PIC_hours"
                    label="121 PIC Hours"
                    type="number"
                    step="0.1"
                    className="w-full rounded mt-4"
                    labelClassName="font-normal text-black"
                    inputClassName="py-3 text-black rounded-none"
                    placeholder="Enter PIC Part 121 Hours"
                  />
                </div>
                <div className="flex gap-4 items-center">
                  <CustomFormField
                    name="part_135_hours"
                    label="135 Hours"
                    type="number"
                    step="0.1"
                    className="w-full rounded mt-4"
                    labelClassName="font-normal text-black"
                    inputClassName="py-3 text-black rounded-none"
                    placeholder="Enter Part 135 Hours"
                  />
                  <CustomFormField
                    name="part_135_PIC_hours"
                    label="135 PIC Hours"
                    type="number"
                    step="0.1"
                    className="w-full rounded mt-4"
                    labelClassName="font-normal text-black"
                    inputClassName="py-3 text-black rounded-none"
                    placeholder="Enter PIC Part 135 Hours"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="pt-5 w-3/5">
            <span className="text-black">Do you have any major flight experience that you would like to highlight</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("has_major_flight_exp") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("has_major_flight_exp", value === "yes")}
                name="commercialPrivileges"
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
          {methods.getValues("has_major_flight_exp") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ amount: 0.5, once: true }}
              className="pt-5 w-3/5"
            >
              <CustomFormField
                name="major_flight_exp"
                label="Do you have any major flight experience that you would like to highlight"
                type="textarea"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Provide Details Here"
              />
            </motion.div>
          )}
          <div className="pt-5">
            <span className="text-black">Do you have commercial Privileges</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("has_commercial_privilege") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("has_commercial_privilege", value === "yes")}
                name="commercialPrivileges"
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
          {methods.getValues("has_commercial_privilege") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ amount: 0.5, once: true }}
              className="pt-5 w-3/5"
            >
              <CustomFormField
                name="commercial_privilege_exp"
                label="If yes, provide details"
                type="textarea"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Provide Details Here"
              />
            </motion.div>
          )}
          <div className="pt-5 flex flex-col">
            <span className="text-black">
              What aircraft have you operated? Specify your role (PIC/SIC) and hours for each type.
            </span>
          </div>
          {operatedAircraftFields &&
            operatedAircraftFields.length > 0 &&
            operatedAircraftFields.map((value, index) => {
              const privilegeType = watch(`aircraft_operated_list.${index}.privilege_type`);
              return (
                <div className="group relative flex gap-4 items-center pt-4" key={index}>
                  <div className="flex flex-col gap-2 w-3/5">
                    <span className="text-black">Other Aircraft {index + 1}</span>
                    <div className="flex gap-4 items-center w-full relative">
                      <CustomFormField
                        name={`aircraft_operated_list.${index}.aircraft`}
                        label=""
                        type="text"
                        className="w-full rounded mt-4"
                        labelClassName="font-normal text-black"
                        inputClassName="py-3 text-black rounded-none"
                        placeholder="Enter Aircraft Name"
                      />
                      <CustomFormField
                        name={`aircraft_operated_list.${index}.flight_hours`}
                        label=""
                        type="number"
                        step="0.1"
                        className="w-full rounded mt-4"
                        labelClassName="font-normal text-black"
                        inputClassName="py-3 text-black rounded-none"
                        placeholder="Enter Hours Here"
                      />
                      <Button
                        type="button"
                        onClick={() => removeOperatedAircraft(index)}
                        className="absolute right-[-20px] top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <div className="flex gap-4 items-center w-full">
                      <CustomFormField
                        className="py-3 text-black rounded-none mt-4 p-2"
                        labelClassName="font-normal text-black"
                        name={`aircraft_operated_list.${index}.privilege_type`}
                        label="PIC"
                        type="checkbox"
                        checked={privilegeType === "PIC"}
                        onChange={() => handlePrivilegeChange(index, "PIC")}
                      />
                      <CustomFormField
                        className="py-3 text-black rounded-none mt-4 p-2"
                        labelClassName="font-normal text-black"
                        name={`aircraft_operated_list.${index}.privilege_type`}
                        label="SIC"
                        type="checkbox"
                        checked={privilegeType === "SIC"}
                        onChange={() => handlePrivilegeChange(index, "SIC")}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          <Button
            type="button"
            onClick={() => appendOperatedAircraft(defaultOperatedAircrafts)}
            className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
            disabled={operatedAircraftFields.length >= 4}
          >
            <Plus className="text-orange-500" />
            Add Aircraft
          </Button>

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
              Continue to Professional Experience
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FlightExperience;

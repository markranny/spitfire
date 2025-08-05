"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { ProfessionalDevelopmentFormData, ProfessionalDevelopmentSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { setFormData } from "@/state";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import useResume from "@/hooks/useResume";
const ProfessionalDevelopment = () => {
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const { saveResumeData, resumeSaving, resumeSavingError } = useResume();
  const defaultTraining = { training: "" };
  const defaultData = {
    has_completed_training: false,
    training_list: [defaultTraining, defaultTraining, defaultTraining],
  };

  const methods = useForm<ProfessionalDevelopmentFormData>({
    resolver: zodResolver(ProfessionalDevelopmentSchema),
    defaultValues: defaultData,
  });
  const {
    fields: trainingFields,
    append: appendTraining,
    remove: removeTraining,
  } = useFieldArray({
    control: methods.control,
    name: "training_list",
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      methods.reset(data);
    }
  }, [methods, formData, navigationStep]);

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Professional Development</h1>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ amount: 0.5, once: true }}
            className="pt-5"
          >
            <span className="pt-5 text-black font-semibold">
              Have you completed training programs (e.g., simulator training, initial ground school)? Provide details.
            </span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue="yes"
                value={methods.watch("has_completed_training") ? "yes" : "no"}
                onValueChange={(value: "yes" | "no") => methods.setValue("has_completed_training", value === "yes")}
                name="completedTrainingPrograms"
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
          </motion.div>

          {methods.getValues("has_completed_training") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ amount: 0.5, once: true }}
              className="flex flex-col w-2/3"
            >
              <span className="text-black">Please list the training programs completed below.</span>
              {trainingFields.length > 0 &&
                trainingFields.map((item, index) => (
                  <div className="group relative flex gap-4 items-center" key={item.id}>
                    <CustomFormField
                      name={`training_list.${index}.training`}
                      placeholder={`Training ${index + 1}`}
                      type="text"
                      label=""
                      className="w-full rounded mt-4"
                      labelClassName="font-normal text-black"
                      inputClassName="py-3 text-black rounded-none p-2"
                    />
                    <Button
                      type="button"
                      onClick={() => removeTraining(index)}
                      className="absolute right-[-20px] top-4/5 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                disabled={trainingFields.length >= 6}
                onClick={() => appendTraining(defaultTraining)}
                className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
              >
                <Plus className="text-orange-500" />
                Add Trainings
              </Button>
            </motion.div>
          )}

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
              Continue to Education
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfessionalDevelopment;

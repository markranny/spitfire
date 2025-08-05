"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { AdditionalSchema, AdditionalFormData } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { setFormData } from "@/state";
import { Plus, Trash2 } from "lucide-react";
import useResume from "@/hooks/useResume";

const Additional: React.FC = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { saveResumeData } = useResume();

  const defaultAwardRecognition = { award_recognition: "", date: null };
  const defaultAchievement = { achievement: "" };

  const defaultData: AdditionalFormData = {
    award_recognition_list: [defaultAwardRecognition, defaultAwardRecognition, defaultAwardRecognition],
    achievement_list: [defaultAchievement, defaultAchievement, defaultAchievement],
  };

  const methods: UseFormReturn<AdditionalFormData> = useForm<AdditionalFormData>({
    resolver: zodResolver(AdditionalSchema),
    defaultValues: defaultData,
  });

  const { control, handleSubmit, reset } = methods;

  const {
    fields: awardRecognitionFields,
    append: appendAwardRecognition,
    remove: removeAwardRecognition,
  } = useFieldArray({
    control,
    name: "award_recognition_list",
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control,
    name: "achievement_list",
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      let { data } = formData[navigationStep];
      const savedData = data as AdditionalFormData;

      if (savedData) {
        const convertedData: AdditionalFormData = {
          award_recognition_list: savedData.award_recognition_list?.length
            ? [
                ...savedData.award_recognition_list.map((item) => ({
                  ...item,
                  date: item.date ? new Date(item.date) : null,
                })),
              ]
            : [...defaultData.award_recognition_list],
          achievement_list: savedData.achievement_list?.length
            ? [...savedData.achievement_list]
            : [...defaultData.achievement_list],
        };
        while (convertedData.award_recognition_list.length < 3)
          convertedData.award_recognition_list.push(defaultAwardRecognition);
        while (convertedData.achievement_list.length < 3) convertedData.achievement_list.push(defaultAchievement);
        reset(convertedData);
      }
    }
  }, [formData, navigationStep, reset]);

  const cleanEmptyFieldsForSave = <T extends object>(items: T[]): T[] => {
    return items.filter((item) => Object.values(item).some((value) => value !== "" && value !== null));
  };

  const prepareDisplayData = (savedData: AdditionalFormData): AdditionalFormData => {
    const result = {
      award_recognition_list: [...(savedData.award_recognition_list || [])],
      achievement_list: [...(savedData.achievement_list || [])],
    };
    while (result.award_recognition_list.length < 3) result.award_recognition_list.push(defaultAwardRecognition);
    while (result.achievement_list.length < 3) result.achievement_list.push(defaultAchievement);
    return result;
  };

  const onSubmit = (data: AdditionalFormData) => {
    const saveData: AdditionalFormData = {
      award_recognition_list: cleanEmptyFieldsForSave(data.award_recognition_list),
      achievement_list: cleanEmptyFieldsForSave(data.achievement_list),
    };

    const isEmpty = Object.values(saveData).every((list) => list.length === 0);
    const modifiedData = isEmpty ? null : saveData;

    const savedData = updateWizardStep("formData", navigationStep, modifiedData, true);
    dispatch(setFormData(savedData));

    const displayData = prepareDisplayData(saveData);
    reset(displayData);

    navigateToStep(navigationStep + 1);
    saveResumeData(savedData);
  };

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Additional Information</h1>
      <p className="text-customgreys-dirtyGrey text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="checkout-details__form flex flex-col gap-5 w-2/3">
          <div className="flex flex-col gap-1 w-full pt-5">
            <span className="text-black">What Awards and Recognitions have you received?</span>
            {awardRecognitionFields.map((item, index) => (
              <div className="group relative flex gap-4 items-center" key={item.id}>
                <CustomFormField
                  name={`award_recognition_list.${index}.award_recognition`}
                  placeholder="Enter your awards and recognitions"
                  type="text"
                  label=""
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black rounded-none p-2"
                />
                <CustomFormField
                  name={`award_recognition_list.${index}.date`}
                  label=""
                  type="date"
                  placeholder="Select a date"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black w-full rounded-none p-2"
                  disabledDates={(date: Date) => date > new Date() || date < new Date("1900-01-01")}
                />

                <Button
                  type="button"
                  onClick={() => removeAwardRecognition(index)}
                  className="absolute right-[-20px] top-4/5 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => appendAwardRecognition(defaultAwardRecognition)}
            disabled={awardRecognitionFields.length >= 5}
            className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
          >
            <Plus className="text-orange-500" />
            Add Award/Recognition
          </Button>

          <div className="flex flex-col gap-1 w-full">
            <span className="text-black">What are your Personal Achievements?</span>
            {achievementFields.map((item, index) => (
              <div className="group relative flex gap-4 items-center" key={item.id}>
                <CustomFormField
                  name={`achievement_list.${index}.achievement`}
                  placeholder="Enter your personal achievements"
                  type="text"
                  label=""
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-black"
                  inputClassName="py-3 text-black rounded-none p-2"
                />

                <Button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="absolute right-[-20px] top-4/5 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => appendAchievement(defaultAchievement)}
            disabled={achievementFields.length >= 5}
            className="w-fit flex gap-2 justify-between min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
          >
            <Plus className="text-orange-500" />
            Add Achievement
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
              Continue to Review
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Additional;

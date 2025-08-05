"use client";
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { PersonalInformationFormData, PersonalInformationSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomFormField } from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { updateWizardStep } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/state/redux";
import { setFormData } from "@/state";
import useResume from "@/hooks/useResume";

const PersonalInformation = () => {
  const { navigateToStep, navigationStep } = useCheckoutNavigation();
  const dispatch = useAppDispatch();
  const { formData } = useAppSelector((state) => state.global);
  const { saveResumeData, resumeSaving } = useResume();

  const methods = useForm<PersonalInformationFormData>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      has_us_passport: false,
      is_authorized_us: false,
    },
  });

  useEffect(() => {
    if (formData && formData.length > 0 && formData[navigationStep]) {
      const { data } = formData[navigationStep];
      methods.reset(data);
    }
  }, [methods, formData, navigationStep]);

  const onSubmit = async (data: PersonalInformationFormData) => {
    try {
      // let response: any;
      const savedData = updateWizardStep("formData", navigationStep, data, true);
      navigateToStep(navigationStep + 1);
      dispatch(setFormData(savedData));
      saveResumeData(savedData);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  return (
    <div className="w-full h-full pl-12 py-12 pr-24">
      <h1 className="text-2xl font-semibold text-black">Personal Information</h1>
      <p className="text-black text-md pt-5">Please fill out all question fields below</p>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="checkout-details__form">
          <div className="flex flex-col">
            <div className="flex gap-4">
              <CustomFormField
                name="first_name"
                label="First Name"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none bg-transparent"
                placeholder="Enter First Name"
              />
              <CustomFormField
                name="last_name"
                label="Last Name"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Last Name"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="email"
                label="Email Address"
                type="email"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter Email Address"
              />
              <CustomFormField
                name="phone_number"
                label="Phone Number"
                type="phone"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-0"
                placeholder="Enter Phone Number"
              />
            </div>
          </div>
          <CustomFormField
            name="address_line_1"
            label="Address Line 1"
            type="text"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Enter your street address"
          />
          <CustomFormField
            name="address_line_2"
            label="Address Line 2"
            type="text"
            className="w-full rounded mt-4"
            labelClassName="font-normal text-black"
            inputClassName="py-3 text-black rounded-none p-2"
            placeholder="Apartment, suite, unit, etc"
          />
          <div className="flex flex-col">
            <div className="flex gap-4">
              <CustomFormField
                name="city"
                label="City"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none bg-transparent"
                placeholder="Enter City"
              />
              <CustomFormField
                name="state"
                label="State"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter State"
              />
            </div>
            <div className="flex gap-4">
              <CustomFormField
                name="zipcode"
                label="ZIP Code"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none"
                placeholder="Enter ZIP Code"
              />
              <CustomFormField
                name="country"
                label="Country"
                type="text"
                className="w-full rounded mt-4"
                labelClassName="font-normal text-black"
                inputClassName="py-3 text-black rounded-none p-2"
                placeholder="Enter Country"
              />
            </div>
          </div>
          <div className="pt-5">
            <span className="text-black">Are you authorized to work in the United States?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue={false ? "yes" : "no"} // Default value as string
                value={methods.watch("is_authorized_us") ? "yes" : "no"} // Convert boolean to string
                onValueChange={(value: string) => {
                  methods.setValue("is_authorized_us", value === "yes"); // Convert string back to boolean
                }}
                name="usAuthorized"
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
          <div className="pt-5">
            <span className="text-black">Do you have a current US Passport?</span>
            <div className="w-1/3 py-2">
              <RadioGroup
                defaultValue={false ? "yes" : "no"} // Default value as string
                value={methods.watch("has_us_passport") ? "yes" : "no"} // Convert boolean to string
                onValueChange={(value: string) => {
                  methods.setValue("has_us_passport", value === "yes"); // Convert string back to boolean
                }}
                name="usAuthorized"
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
          <div className="pt-10 w-full flex justify-end">
            <Button
              type="submit"
              className="w-fit min-w-32 px-3 my-6 py-3 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow text-sm font-semibold"
              disabled={resumeSaving}
            >
              {resumeSaving ? "Saving..." : "Continue to Certificates and Ratings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInformation;
